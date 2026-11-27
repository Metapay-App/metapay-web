import { normalizeToEvmAndMe } from "@/core/utils/address";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/server/shared/errors/app-error";
import { toInvoiceDto, type InvoiceDto } from "../domain/invoice.entity";
import type { InvoiceRepository } from "../domain/invoice.repository";

export interface CancelInvoiceCommand {
  refId: string;
  merchantId?: string;
  actorAddress?: string;
}

export class CancelInvoiceUseCase {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  public async execute(command: CancelInvoiceCommand): Promise<InvoiceDto> {
    const invoice = await this.invoiceRepo.findByRefId(command.refId);
    if (!invoice) {
      throw new NotFoundError("Invoice not found", "INVOICE_NOT_FOUND");
    }

    const normalizedActor = command.actorAddress
      ? normalizeToEvmAndMe(command.actorAddress).evmAddress.toLowerCase()
      : null;

    const authorizedByMerchant =
      Boolean(command.merchantId) && invoice.merchantId === command.merchantId;
    const authorizedByRecipient =
      Boolean(normalizedActor) &&
      invoice.recipientAddress.toLowerCase() === normalizedActor;

    if (!authorizedByMerchant && !authorizedByRecipient) {
      throw new ForbiddenError(
        "You are not authorized to cancel this invoice",
        "FORBIDDEN"
      );
    }

    if (invoice.status === "PAID") {
      throw new ConflictError("Invoice is already paid", "INVOICE_ALREADY_PAID");
    }
    if (invoice.status === "CANCELLED") {
      throw new ConflictError(
        "Invoice is already cancelled",
        "INVOICE_ALREADY_CANCELLED"
      );
    }

    const updated = await this.invoiceRepo.updateStatus(
      command.refId,
      "CANCELLED"
    );
    return toInvoiceDto(updated);
  }
}
