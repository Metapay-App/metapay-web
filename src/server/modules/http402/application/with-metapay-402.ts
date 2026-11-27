import { NextRequest, NextResponse } from "next/server";
import {
  CHAIN_CONFIG,
  CONTRACT_ADDRESSES,
  findTokenByAddress,
} from "@/core/constants/contracts";
import {
  CreateInvoiceUseCase,
  type CreateInvoiceSplitInput,
} from "@/server/modules/invoice/application/create-invoice.usecase";
import type { InvoiceRepository } from "@/server/modules/invoice/domain/invoice.repository";
import { defaultInvoiceRepository } from "@/server/modules/invoice/infrastructure/prisma-invoice.repository";
import { VerifyAndRecordPaymentUseCase } from "@/server/modules/payment/application/verify-and-record-payment.usecase";
import type { TransactionDto } from "@/server/modules/payment/domain/transaction.entity";
import type { TransactionRepository } from "@/server/modules/payment/domain/transaction.repository";
import { defaultTransactionRepository } from "@/server/modules/payment/infrastructure/prisma-transaction.repository";
import {
  defaultOnChainPaymentVerifier,
  type OnChainPaymentVerifier,
} from "@/server/shared/blockchain/evm-client";
import { BadRequestError, ConflictError } from "@/server/shared/errors/app-error";
import { handleApiError } from "@/server/shared/http/response";
import type { Http402Repository } from "../domain/http402.repository";
import { defaultHttp402Repository } from "../infrastructure/prisma-http402.repository";

export interface MetaPay402Config {
  recipient: string;
  targetToken: string;
  targetAmount: string;
  expirySeconds?: number;
  splits?: CreateInvoiceSplitInput[];
  description?: string;
  appBaseUrl?: string;
}

export interface MetaPay402Context {
  refId: string;
  txHash: string;
  payment: TransactionDto;
}

export type MetaPay402Handler = (
  req: NextRequest,
  context: MetaPay402Context
) => Promise<NextResponse> | NextResponse;

export interface MetaPay402Dependencies {
  invoiceRepo: InvoiceRepository;
  txRepo: TransactionRepository;
  http402Repo: Http402Repository;
  onChainVerifier: OnChainPaymentVerifier;
}

const BYTES32_HEX_REGEX = /^0x[a-fA-F0-9]{64}$/;

export function createMetaPay402Wrapper(deps: MetaPay402Dependencies) {
  const createInvoiceUseCase = new CreateInvoiceUseCase(deps.invoiceRepo);
  const verifyPaymentUseCase = new VerifyAndRecordPaymentUseCase(
    deps.txRepo,
    deps.invoiceRepo,
    deps.onChainVerifier
  );

  return function withMetaPay402(
    handler: MetaPay402Handler,
    config: MetaPay402Config
  ) {
    return async function wrappedHandler(
      req: NextRequest
    ): Promise<NextResponse> {
      try {
        const txHash = req.headers.get("x-metapay-tx")?.trim();
        const refId = req.headers.get("x-metapay-ref")?.trim();

        if (!txHash || !refId) {
          const isFixed =
            config.expirySeconds !== undefined && config.expirySeconds > 0;
          const invoice = await createInvoiceUseCase.execute({
            recipient: config.recipient,
            targetToken: config.targetToken,
            targetAmount: config.targetAmount,
            expiryType: isFixed ? "FIXED" : "NO_LIMIT",
            expirySeconds: isFixed ? config.expirySeconds : null,
            splits: config.splits,
            source: "HTTP_402",
            description:
              config.description ??
              `HTTP 402 payment for ${new URL(req.url).pathname}`,
          });

          const tokenMeta = findTokenByAddress(invoice.targetToken);
          const baseUrl = (
            config.appBaseUrl ??
            process.env.NEXT_PUBLIC_APP_URL ??
            "http://localhost:3000"
          ).replace(/\/+$/, "");

          return NextResponse.json(
            {
              code: "PAYMENT_REQUIRED",
              message: "Payment required to access this protected resource",
              payment: {
                refId: invoice.refId,
                chainId: CHAIN_CONFIG.chainId,
                gatewayAddress: CONTRACT_ADDRESSES.gateway,
                recipient: invoice.recipientAddress,
                recipientMeAddress: invoice.recipientMeAddress,
                targetToken: invoice.targetToken,
                targetTokenSymbol: tokenMeta?.symbol ?? invoice.targetToken,
                targetAmount: invoice.targetAmount,
                expiryType: invoice.expiryType,
                expiresAt: invoice.expiresAt,
                splits: invoice.splits,
                checkoutUrl: `${baseUrl}/id/pay/${invoice.refId}`,
              },
            },
            {
              status: 402,
              headers: {
                "X-MetaPay-Ref": invoice.refId,
                "X-MetaPay-Chain-Id": String(CHAIN_CONFIG.chainId),
                "X-MetaPay-Contract": CONTRACT_ADDRESSES.gateway,
              },
            }
          );
        }

        if (!BYTES32_HEX_REGEX.test(refId)) {
          throw new BadRequestError(
            "Invalid X-MetaPay-Ref header format",
            "INVALID_REF_ID"
          );
        }
        if (!BYTES32_HEX_REGEX.test(txHash)) {
          throw new BadRequestError(
            "Invalid X-MetaPay-Tx header format",
            "INVALID_TX_HASH"
          );
        }

        const existingProof = await deps.http402Repo.findByRefIdOrTxHash(
          refId,
          txHash
        );
        if (existingProof) {
          throw new ConflictError(
            "Payment proof has already been consumed",
            "PROOF_ALREADY_USED"
          );
        }

        const payment = await verifyPaymentUseCase.execute({ refId, txHash });

        await deps.http402Repo.createReceipt({
          refId,
          txHash: payment.txHash,
          endpoint: new URL(req.url).pathname,
          payerAddress: payment.payerAddress,
        });

        return await handler(req, {
          refId,
          txHash: payment.txHash,
          payment,
        });
      } catch (error) {
        return handleApiError(error);
      }
    };
  };
}

export const withMetaPay402 = createMetaPay402Wrapper({
  invoiceRepo: defaultInvoiceRepository,
  txRepo: defaultTransactionRepository,
  http402Repo: defaultHttp402Repository,
  onChainVerifier: defaultOnChainPaymentVerifier,
});
