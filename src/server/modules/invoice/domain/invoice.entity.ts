export type ExpiryType = "FIXED" | "NO_LIMIT";
export type InvoiceStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
export type InvoiceSource = "DASHBOARD" | "API" | "HTTP_402";

export interface SplitEntry {
  recipient: string;
  recipientMeAddress: string;
  bps: number;
}

export interface InvoiceEntity {
  id: string;
  refId: string;
  merchantId: string | null;
  recipientAddress: string;
  recipientMeAddress: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt: Date | null;
  splits: SplitEntry[];
  status: InvoiceStatus;
  source: InvoiceSource;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceDto {
  id: string;
  refId: string;
  merchantId: string | null;
  recipientAddress: string;
  recipientMeAddress: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt: string | null;
  splits: SplitEntry[];
  status: InvoiceStatus;
  source: InvoiceSource;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export function resolveEffectiveInvoiceStatus(
  entity: InvoiceEntity,
  now: Date = new Date()
): InvoiceStatus {
  if (
    entity.status === "PENDING" &&
    entity.expiryType === "FIXED" &&
    entity.expiresAt !== null &&
    entity.expiresAt.getTime() <= now.getTime()
  ) {
    return "EXPIRED";
  }
  return entity.status;
}

export function toInvoiceDto(
  entity: InvoiceEntity,
  now: Date = new Date()
): InvoiceDto {
  return {
    id: entity.id,
    refId: entity.refId,
    merchantId: entity.merchantId,
    recipientAddress: entity.recipientAddress,
    recipientMeAddress: entity.recipientMeAddress,
    targetToken: entity.targetToken,
    targetAmount: entity.targetAmount,
    expiryType: entity.expiryType,
    expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
    splits: entity.splits,
    status: resolveEffectiveInvoiceStatus(entity, now),
    source: entity.source,
    description: entity.description,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
