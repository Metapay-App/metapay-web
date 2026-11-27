import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import { CONTRACT_ADDRESSES } from "@/core/constants/contracts";
import type {
  InvoiceEntity,
  InvoiceStatus,
} from "@/server/modules/invoice/domain/invoice.entity";
import type {
  CreateInvoiceRecordInput,
  InvoiceRepository,
  ListInvoicesFilter,
} from "@/server/modules/invoice/domain/invoice.repository";
import type {
  TransactionEntity,
} from "@/server/modules/payment/domain/transaction.entity";
import type {
  CreateTransactionRecordInput,
  ListTransactionsFilter,
  TransactionRepository,
} from "@/server/modules/payment/domain/transaction.repository";
import type {
  OnChainPaymentVerifier,
  VerifiedOnChainPayment,
} from "@/server/shared/blockchain/evm-client";
import type {
  CreateHttp402ReceiptInput,
  Http402ReceiptEntity,
  Http402Repository,
} from "../../domain/http402.repository";
import { createMetaPay402Wrapper } from "../with-metapay-402";

class MemoryInvoiceRepo implements InvoiceRepository {
  public readonly map = new Map<string, InvoiceEntity>();

  public async create(input: CreateInvoiceRecordInput): Promise<InvoiceEntity> {
    const now = new Date();
    const inv: InvoiceEntity = {
      id: `inv_${this.map.size + 1}`,
      refId: input.refId,
      merchantId: input.merchantId,
      recipientAddress: input.recipientAddress,
      recipientMeAddress: input.recipientMeAddress,
      targetToken: input.targetToken,
      targetAmount: input.targetAmount,
      expiryType: input.expiryType,
      expiresAt: input.expiresAt,
      splits: input.splits,
      status: "PENDING",
      source: input.source,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };
    this.map.set(inv.refId, inv);
    return inv;
  }

  public async findByRefId(refId: string): Promise<InvoiceEntity | null> {
    return this.map.get(refId) ?? null;
  }

  public async list(_filter: ListInvoicesFilter): Promise<InvoiceEntity[]> {
    return Array.from(this.map.values());
  }

  public async updateStatus(
    refId: string,
    status: InvoiceStatus
  ): Promise<InvoiceEntity> {
    const found = this.map.get(refId);
    if (!found) throw new Error("Not found");
    const updated = { ...found, status, updatedAt: new Date() };
    this.map.set(refId, updated);
    return updated;
  }
}

class MemoryTxRepo implements TransactionRepository {
  public readonly byHash = new Map<string, TransactionEntity>();

  public async findByTxHash(txHash: string): Promise<TransactionEntity | null> {
    return this.byHash.get(txHash) ?? null;
  }

  public async createAndMarkInvoicePaid(
    input: CreateTransactionRecordInput,
    markInvoicePaidRefId: string | null
  ): Promise<TransactionEntity> {
    void markInvoicePaidRefId;
    const entity: TransactionEntity = {
      id: `tx_${this.byHash.size + 1}`,
      ...input,
      createdAt: new Date(),
    };
    this.byHash.set(entity.txHash, entity);
    return entity;
  }

  public async listByUser(
    _filter: ListTransactionsFilter
  ): Promise<TransactionEntity[]> {
    return Array.from(this.byHash.values());
  }
}

class MemoryHttp402Repo implements Http402Repository {
  private readonly receipts: Http402ReceiptEntity[] = [];

  public async findByRefIdOrTxHash(
    refId: string,
    txHash: string
  ): Promise<Http402ReceiptEntity | null> {
    return (
      this.receipts.find((r) => r.refId === refId || r.txHash === txHash) ?? null
    );
  }

  public async createReceipt(
    input: CreateHttp402ReceiptInput
  ): Promise<Http402ReceiptEntity> {
    const receipt: Http402ReceiptEntity = {
      id: `r402_${this.receipts.length + 1}`,
      ...input,
      verifiedAt: new Date(),
    };
    this.receipts.push(receipt);
    return receipt;
  }
}

describe("withMetaPay402 middleware", () => {
  const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const payer = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const sampleTxHash =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  it("returns 402 Payment Required when proof headers are missing, then 200 OK after proof, and 409 on replay", async () => {
    const invoiceRepo = new MemoryInvoiceRepo();
    const txRepo = new MemoryTxRepo();
    const http402Repo = new MemoryHttp402Repo();

    const verifier: OnChainPaymentVerifier = {
      async verifySettledPayment(
        txHash: string,
        expectedRefId: string
      ): Promise<VerifiedOnChainPayment> {
        return {
          txHash,
          refId: expectedRefId,
          payer,
          recipient,
          payToken: CONTRACT_ADDRESSES.IDRC,
          payAmount: "1604815",
          targetToken: CONTRACT_ADDRESSES.mUSDT,
          targetAmount: "1000000",
          paidAt: new Date(),
          isSplit: false,
          splits: [],
          blockNumber: 12345,
          chainId: 400,
        };
      },
    };

    const withMetaPay402 = createMetaPay402Wrapper({
      invoiceRepo,
      txRepo,
      http402Repo,
      onChainVerifier: verifier,
    });

    const protectedRoute = withMetaPay402(
      async (_req, ctx) => {
        return NextResponse.json({ secret: "unlocked", refId: ctx.refId });
      },
      {
        recipient,
        targetToken: "mUSDT",
        targetAmount: "1000000",
        expirySeconds: 300,
      }
    );

    // 1. Unpaid request -> 402 Payment Required
    const firstRes = await protectedRoute(
      new NextRequest("http://localhost:3000/api/v1/demo/premium-data")
    );
    expect(firstRes.status).toBe(402);
    const challengeBody = (await firstRes.json()) as {
      code: string;
      payment: { refId: string; targetToken: string; targetAmount: string };
    };
    expect(challengeBody.code).toBe("PAYMENT_REQUIRED");
    expect(challengeBody.payment.targetToken).toBe(CONTRACT_ADDRESSES.mUSDT);
    expect(challengeBody.payment.targetAmount).toBe("1000000");

    const refId = challengeBody.payment.refId;

    // 2. Paid request with proof headers -> 200 OK
    const secondRes = await protectedRoute(
      new NextRequest("http://localhost:3000/api/v1/demo/premium-data", {
        headers: {
          "x-metapay-ref": refId,
          "x-metapay-tx": sampleTxHash,
        },
      })
    );
    expect(secondRes.status).toBe(200);
    const unlockedBody = (await secondRes.json()) as {
      secret: string;
      refId: string;
    };
    expect(unlockedBody.secret).toBe("unlocked");
    expect(unlockedBody.refId).toBe(refId);

    // 3. Replay attempt with same proof -> 409 Conflict
    const replayRes = await protectedRoute(
      new NextRequest("http://localhost:3000/api/v1/demo/premium-data", {
        headers: {
          "x-metapay-ref": refId,
          "x-metapay-tx": sampleTxHash,
        },
      })
    );
    expect(replayRes.status).toBe(409);
  });
});
