import type { Invoice, Prisma } from "@prisma/client";
import { prisma } from "@/server/shared/db/prisma";
import type { InvoiceEntity, SplitEntry } from "../domain/invoice.entity";
import type {
  CreateInvoiceRecordInput,
  InvoiceRepository,
  ListInvoicesFilter,
} from "../domain/invoice.repository";

function isSplitEntry(value: unknown): value is SplitEntry {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.recipient === "string" &&
    typeof candidate.recipientMeAddress === "string" &&
    typeof candidate.bps === "number"
  );
}

function parseSplitsJson(raw: Prisma.JsonValue | null): SplitEntry[] {
  if (!Array.isArray(raw)) return [];
  const result: SplitEntry[] = [];
  for (const item of raw) {
    if (isSplitEntry(item)) {
      result.push(item);
    }
  }
  return result;
}

function mapInvoiceRecord(record: Invoice): InvoiceEntity {
  return {
    id: record.id,
    refId: record.refId,
    merchantId: record.merchantId,
    recipientAddress: record.recipientAddress,
    recipientMeAddress: record.recipientMeAddress,
    targetToken: record.targetToken,
    targetAmount: record.targetAmount,
    expiryType: record.expiryType,
    expiresAt: record.expiresAt,
    splits: parseSplitsJson(record.splits),
    status: record.status,
    source: record.source,
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaInvoiceRepository implements InvoiceRepository {
  public async create(
    input: CreateInvoiceRecordInput
  ): Promise<InvoiceEntity> {
    const splitsJson: Prisma.InputJsonValue = input.splits.map((s) => ({
      recipient: s.recipient,
      recipientMeAddress: s.recipientMeAddress,
      bps: s.bps,
    }));

    const created = await prisma.invoice.create({
      data: {
        refId: input.refId,
        merchantId: input.merchantId,
        recipientAddress: input.recipientAddress,
        recipientMeAddress: input.recipientMeAddress,
        targetToken: input.targetToken,
        targetAmount: input.targetAmount,
        expiryType: input.expiryType,
        expiresAt: input.expiresAt,
        splits: splitsJson,
        source: input.source,
        description: input.description,
      },
    });
    return mapInvoiceRecord(created);
  }

  public async findByRefId(refId: string): Promise<InvoiceEntity | null> {
    const found = await prisma.invoice.findUnique({ where: { refId } });
    return found ? mapInvoiceRecord(found) : null;
  }

  public async list(filter: ListInvoicesFilter): Promise<InvoiceEntity[]> {
    const rows = await prisma.invoice.findMany({
      where: {
        ...(filter.merchantId ? { merchantId: filter.merchantId } : {}),
        ...(filter.recipientAddress
          ? { recipientAddress: filter.recipientAddress }
          : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: filter.limit,
      skip: filter.offset,
    });
    return rows.map(mapInvoiceRecord);
  }

  public async updateStatus(
    refId: string,
    status: InvoiceEntity["status"]
  ): Promise<InvoiceEntity> {
    const updated = await prisma.invoice.update({
      where: { refId },
      data: { status },
    });
    return mapInvoiceRecord(updated);
  }
}

export const defaultInvoiceRepository = new PrismaInvoiceRepository();
