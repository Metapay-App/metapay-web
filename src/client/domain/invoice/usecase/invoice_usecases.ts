import type {
  CreateInvoicePayload,
  InvoiceItem,
} from "../entity/invoice_entity";
import type {
  InvoiceRepository,
  ListInvoicesParams,
} from "../repository/invoice_repository";

export class CreateInvoiceUseCase {
  public constructor(private readonly repository: InvoiceRepository) {}

  public execute(
    payload: CreateInvoicePayload,
    apiKey?: string
  ): Promise<InvoiceItem> {
    return this.repository.createInvoice(payload, apiKey);
  }
}

export class ListInvoicesUseCase {
  public constructor(private readonly repository: InvoiceRepository) {}

  public execute(params: ListInvoicesParams): Promise<InvoiceItem[]> {
    return this.repository.listInvoices(params);
  }
}

export class GetInvoiceByRefIdUseCase {
  public constructor(private readonly repository: InvoiceRepository) {}

  public execute(refId: string): Promise<InvoiceItem> {
    return this.repository.getInvoiceByRefId(refId);
  }
}

export class CancelInvoiceUseCase {
  public constructor(private readonly repository: InvoiceRepository) {}

  public execute(
    refId: string,
    actorAddress?: string,
    apiKey?: string
  ): Promise<InvoiceItem> {
    return this.repository.cancelInvoice(refId, actorAddress, apiKey);
  }
}
