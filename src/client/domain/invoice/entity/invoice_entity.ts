export type ExpiryType = "FIXED" | "NO_LIMIT";
export type InvoiceStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
export type InvoiceSource = "DASHBOARD" | "API" | "HTTP_402";

export interface SplitRuleItem {
  recipient: string;
  recipientMeAddress?: string;
  bps: number;
}

export interface InvoiceItem {
  id: string;
  refId: string;
  merchantId: string | null;
  recipientAddress: string;
  recipientMeAddress: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt: string | null;
  splits: SplitRuleItem[];
  status: InvoiceStatus;
  source: InvoiceSource;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoicePayload {
  recipient: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt?: string;
  expirySeconds?: number;
  splits?: Array<{ recipient: string; bps: number }>;
  description?: string;
}
