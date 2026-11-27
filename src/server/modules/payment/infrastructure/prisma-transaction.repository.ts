import type { Prisma, Transaction } from "@prisma/client";
import type { VerifiedSplitDistribution } from "@/server/shared/blockchain/evm-client";
import { prisma } from "@/server/shared/db/prisma";
import type { TransactionEntity } from "../domain/transaction.entity";
import type {
  CreateTransactionRecordInput,
  ListTransactionsFilter,
  TransactionRepository,
} from "../domain/transaction.repository";

function isVerifiedSplit(value: unknown): value is VerifiedSplitDistribution {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.recipient === "string" &&
    typeof candidate.token === "string" &&
    typeof candidate.amount === "string"
  );
}

function parseSplitsJson(raw: Prisma.JsonValue | null): VerifiedSplitDistribution[] {
  if (!Array.isArray(raw)) return [];
  const result: VerifiedSplitDistribution[] = [];
  for (const item of raw) {
    if (isVerifiedSplit(item)) {
      result.push(item);
    }
  }
  return result;
}

function mapTransactionRecord(record: Transaction): TransactionEntity {
  return {
    id: record.id,
    txHash: record.txHash,
    refId: record.refId,
    invoiceId: record.invoiceId,
    payerAddress: record.payerAddress,
    payerMeAddress: record.payerMeAddress,
    recipientAddress: record.recipientAddress,
    payToken: record.payToken,
    payAmount: record.payAmount,
    targetToken: record.targetToken,
    targetAmount: record.targetAmount,
    isSplit: record.isSplit,
    splits: parseSplitsJson(record.splits),
    blockNumber: record.blockNumber,
    chainId: record.chainId,
    paidAt: record.paidAt,
    createdAt: record.createdAt,
  };
}

export class PrismaTransactionRepository implements TransactionRepository {
  public async findByTxHash(txHash: string): Promise<TransactionEntity | null> {
    const found = await prisma.transaction.findUnique({ where: { txHash } });
    return found ? mapTransactionRecord(found) : null;
  }

  public async createAndMarkInvoicePaid(
    input: CreateTransactionRecordInput,
    markInvoicePaidRefId: string | null
  ): Promise<TransactionEntity> {
    const splitsJson: Prisma.InputJsonValue = input.splits.map((s) => ({
      recipient: s.recipient,
      token: s.token,
      amount: s.amount,
    }));

    const created = await prisma.$transaction(async (tx) => {
      if (markInvoicePaidRefId) {
        await tx.invoice.update({
          where: { refId: markInvoicePaidRefId },
          data: { status: "PAID" },
        });
      }

      return tx.transaction.create({
        data: {
          txHash: input.txHash,
          refId: input.refId,
          invoiceId: input.invoiceId,
          payerAddress: input.payerAddress,
          payerMeAddress: input.payerMeAddress,
          recipientAddress: input.recipientAddress,
          payToken: input.payToken,
          payAmount: input.payAmount,
          targetToken: input.targetToken,
          targetAmount: input.targetAmount,
          isSplit: input.isSplit,
          splits: splitsJson,
          blockNumber: input.blockNumber,
          chainId: input.chainId,
          paidAt: input.paidAt,
        },
      });
    });

    return mapTransactionRecord(created);
  }

  public async listByUser(
    filter: ListTransactionsFilter
  ): Promise<TransactionEntity[]> {
    const roleWhere: Prisma.TransactionWhereInput =
      filter.role === "payer"
        ? { payerAddress: filter.address }
        : filter.role === "recipient"
        ? { recipientAddress: filter.address }
        : {
            OR: [
              { payerAddress: filter.address },
              { recipientAddress: filter.address },
            ],
          };

    const rows = await prisma.transaction.findMany({
      where: {
        ...roleWhere,
        ...(filter.token ? { targetToken: filter.token } : {}),
      },
      orderBy: { paidAt: "desc" },
      take: filter.limit,
      skip: filter.offset,
    });

    return rows.map(mapTransactionRecord);
  }
}

export const defaultTransactionRepository = new PrismaTransactionRepository();
