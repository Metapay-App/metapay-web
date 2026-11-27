import type {
  ExpiryType,
  InvoiceEntity,
  InvoiceSource,
  InvoiceStatus,
  SplitEntry,
} from "./invoice.entity";

export interface CreateInvoiceRecordInput {
  refId: string;
  merchantId: string | null;
  recipientAddress: string;
  recipientMeAddress: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt: Date | null;
  splits: SplitEntry[];
  source: InvoiceSource;
  description: string | null;
}

export interface ListInvoicesFilter {
  merchantId?: string;
  recipientAddress?: string;
  status?: InvoiceStatus;
  limit: number;
  offset: number;
}

export interface InvoiceRepository {
  create(input: CreateInvoiceRecordInput): Promise<InvoiceEntity>;
  findByRefId(refId: string): Promise<InvoiceEntity | null>;
  list(filter: ListInvoicesFilter): Promise<InvoiceEntity[]>;
  updateStatus(refId: string, status: InvoiceStatus): Promise<InvoiceEntity>;
}
