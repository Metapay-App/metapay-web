import { NextRequest } from "next/server";
import { z } from "zod";
import { defaultInvoiceRepository } from "@/server/modules/invoice/infrastructure/prisma-invoice.repository";
import { VerifyAndRecordPaymentUseCase } from "@/server/modules/payment/application/verify-and-record-payment.usecase";
import { defaultTransactionRepository } from "@/server/modules/payment/infrastructure/prisma-transaction.repository";
import { defaultOnChainPaymentVerifier } from "@/server/shared/blockchain/evm-client";
import { handleApiError, ok } from "@/server/shared/http/response";

const verifyPaymentSchema = z.object({
  refId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid bytes32 refId"),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid txHash"),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = verifyPaymentSchema.parse(body);

    const useCase = new VerifyAndRecordPaymentUseCase(
      defaultTransactionRepository,
      defaultInvoiceRepository,
      defaultOnChainPaymentVerifier
    );
    const transaction = await useCase.execute(parsed);
    return ok({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}
