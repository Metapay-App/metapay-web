import { API_ROUTES } from "@/core/constants/api-routes";
import { apiClient } from "@/core/http-client/api-client";
import { buildQueryString } from "@/core/http-client/query";
import type {
  CreateInvoicePayload,
  InvoiceItem,
} from "@/client/domain/invoice/entity/invoice_entity";
import type { ListInvoicesParams } from "@/client/domain/invoice/repository/invoice_repository";

export class InvoiceRemoteDataSource {
  public async createInvoice(
    payload: CreateInvoicePayload,
    apiKey?: string
  ): Promise<InvoiceItem> {
    const res = await apiClient.post<{ invoice: InvoiceItem }>(
      API_ROUTES.INVOICES,
      payload,
      apiKey ? { headers: { "x-api-key": apiKey } } : undefined
    );
    return res.invoice;
  }

  public async listInvoices(params: ListInvoicesParams): Promise<InvoiceItem[]> {
    const query = buildQueryString({
      merchantId: params.merchantId,
      recipient: params.recipient,
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    });
    const res = await apiClient.get<{ invoices: InvoiceItem[] }>(
      `${API_ROUTES.INVOICES}${query}`
    );
    return res.invoices;
  }

  public async getInvoiceByRefId(refId: string): Promise<InvoiceItem> {
    const res = await apiClient.get<{ invoice: InvoiceItem }>(
      API_ROUTES.INVOICE_DETAIL(refId)
    );
    return res.invoice;
  }

  public async cancelInvoice(
    refId: string,
    actorAddress?: string,
    apiKey?: string
  ): Promise<InvoiceItem> {
    const res = await apiClient.post<{ invoice: InvoiceItem }>(
      API_ROUTES.INVOICE_CANCEL(refId),
      actorAddress ? { actorAddress } : {},
      apiKey ? { headers: { "x-api-key": apiKey } } : undefined
    );
    return res.invoice;
  }
}
