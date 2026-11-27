import { NotFoundError } from "@/server/shared/errors/app-error";
import { toInvoiceDto, type InvoiceDto } from "../domain/invoice.entity";
import type { InvoiceRepository } from "../domain/invoice.repository";

export class GetInvoiceUseCase {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  public async execute(refId: string): Promise<InvoiceDto> {
    const invoice = await this.invoiceRepo.findByRefId(refId);
    if (!invoice) {
      throw new NotFoundError("Invoice not found", "INVOICE_NOT_FOUND");
    }
    return toInvoiceDto(invoice);
  }
}
