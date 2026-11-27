import { normalizeToEvmAndMe } from "@/core/utils/address";
import { BadRequestError } from "@/server/shared/errors/app-error";
import {
  toInvoiceDto,
  type InvoiceDto,
  type InvoiceStatus,
} from "../domain/invoice.entity";
import type { InvoiceRepository } from "../domain/invoice.repository";

export interface ListInvoicesCommand {
  merchantId?: string;
  recipient?: string;
  status?: InvoiceStatus;
  limit?: number;
  offset?: number;
}

export class ListInvoicesUseCase {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  public async execute(command: ListInvoicesCommand): Promise<InvoiceDto[]> {
    let recipientAddress: string | undefined;
    if (command.recipient) {
      try {
        recipientAddress = normalizeToEvmAndMe(command.recipient).evmAddress;
      } catch (err) {
        throw new BadRequestError(
          err instanceof Error ? err.message : "Invalid recipient address",
          "INVALID_ADDRESS"
        );
      }
    }

    const limit = Math.min(Math.max(command.limit ?? 20, 1), 100);
    const offset = Math.max(command.offset ?? 0, 0);

    const items = await this.invoiceRepo.list({
      merchantId: command.merchantId,
      recipientAddress,
      status: command.status,
      limit,
      offset,
    });

    return items.map((item) => toInvoiceDto(item));
  }
}
