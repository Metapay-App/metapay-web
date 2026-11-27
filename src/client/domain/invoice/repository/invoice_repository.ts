import type {
  CreateInvoicePayload,
  InvoiceItem,
  InvoiceStatus,
} from "../entity/invoice_entity";

export interface ListInvoicesParams {
  merchantId?: string;
  recipient?: string;
  status?: InvoiceStatus;
  limit?: number;
  offset?: number;
}

export interface InvoiceRepository {
  createInvoice(
    payload: CreateInvoicePayload,
    apiKey?: string
  ): Promise<InvoiceItem>;
  listInvoices(params: ListInvoicesParams): Promise<InvoiceItem[]>;
  getInvoiceByRefId(refId: string): Promise<InvoiceItem>;
  cancelInvoice(
    refId: string,
    actorAddress?: string,
    apiKey?: string
  ): Promise<InvoiceItem>;
}
