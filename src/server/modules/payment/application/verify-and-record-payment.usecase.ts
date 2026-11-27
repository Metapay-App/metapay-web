import { convert0xToMeAddress } from "@/core/utils/address";
import type { InvoiceRepository } from "@/server/modules/invoice/domain/invoice.repository";
import type { OnChainPaymentVerifier } from "@/server/shared/blockchain/evm-client";
import { ConflictError } from "@/server/shared/errors/app-error";
import {
  toTransactionDto,
  type TransactionDto,
} from "../domain/transaction.entity";
import type { TransactionRepository } from "../domain/transaction.repository";

export interface VerifyAndRecordPaymentCommand {
  refId: string;
  txHash: string;
}

export class VerifyAndRecordPaymentUseCase {
  constructor(
    private readonly txRepo: TransactionRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly onChainVerifier: OnChainPaymentVerifier
  ) {}

  public async execute(
    command: VerifyAndRecordPaymentCommand
  ): Promise<TransactionDto> {
    const existing = await this.txRepo.findByTxHash(command.txHash);
    if (existing) {
      if (existing.refId.toLowerCase() !== command.refId.toLowerCase()) {
        throw new ConflictError(
          "Transaction hash is already recorded for a different payment reference",
          "TX_REPLAY"
        );
      }
      return toTransactionDto(existing);
    }

    const verified = await this.onChainVerifier.verifySettledPayment(
      command.txHash,
      command.refId
    );

    const invoice = await this.invoiceRepo.findByRefId(command.refId);
    if (invoice) {
      if (invoice.status === "CANCELLED") {
        throw new ConflictError(
          "Invoice has been cancelled",
          "INVOICE_CANCELLED"
        );
      }
      if (
        invoice.recipientAddress.toLowerCase() !==
          verified.recipient.toLowerCase() ||
        invoice.targetToken.toLowerCase() !==
          verified.targetToken.toLowerCase() ||
        invoice.targetAmount !== verified.targetAmount
      ) {
        throw new ConflictError(
          "On-chain payment terms do not match invoice",
          "INVOICE_MISMATCH"
        );
      }
    }

    const payerMeAddress = convert0xToMeAddress(verified.payer);

    const recorded = await this.txRepo.createAndMarkInvoicePaid(
      {
        txHash: verified.txHash,
        refId: verified.refId,
        invoiceId: invoice ? invoice.id : null,
        payerAddress: verified.payer,
        payerMeAddress,
        recipientAddress: verified.recipient,
        payToken: verified.payToken,
        payAmount: verified.payAmount,
        targetToken: verified.targetToken,
        targetAmount: verified.targetAmount,
        isSplit: verified.isSplit,
        splits: verified.splits,
        blockNumber: verified.blockNumber,
        chainId: verified.chainId,
        paidAt: verified.paidAt,
      },
      invoice && invoice.status !== "PAID" ? invoice.refId : null
    );

    return toTransactionDto(recorded);
  }
}
