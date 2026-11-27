import type {
  CreateInvoicePayload,
  InvoiceItem,
} from "@/client/domain/invoice/entity/invoice_entity";
import type {
  InvoiceRepository,
  ListInvoicesParams,
} from "@/client/domain/invoice/repository/invoice_repository";
import type { InvoiceRemoteDataSource } from "../data_source/invoice_remote_data_source";

export class InvoiceRepositoryImpl implements InvoiceRepository {
  public constructor(
    private readonly remoteDataSource: InvoiceRemoteDataSource
  ) {}

  public createInvoice(
    payload: CreateInvoicePayload,
    apiKey?: string
  ): Promise<InvoiceItem> {
    return this.remoteDataSource.createInvoice(payload, apiKey);
  }

  public listInvoices(params: ListInvoicesParams): Promise<InvoiceItem[]> {
    return this.remoteDataSource.listInvoices(params);
  }

  public getInvoiceByRefId(refId: string): Promise<InvoiceItem> {
    return this.remoteDataSource.getInvoiceByRefId(refId);
  }

  public cancelInvoice(
    refId: string,
    actorAddress?: string,
    apiKey?: string
  ): Promise<InvoiceItem> {
    return this.remoteDataSource.cancelInvoice(refId, actorAddress, apiKey);
  }
}
