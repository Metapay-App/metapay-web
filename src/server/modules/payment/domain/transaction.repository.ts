import type { VerifiedSplitDistribution } from "@/server/shared/blockchain/evm-client";
import type { TransactionEntity } from "./transaction.entity";

export interface CreateTransactionRecordInput {
  txHash: string;
  refId: string;
  invoiceId: string | null;
  payerAddress: string;
  payerMeAddress: string;
  recipientAddress: string;
  payToken: string;
  payAmount: string;
  targetToken: string;
  targetAmount: string;
  isSplit: boolean;
  splits: VerifiedSplitDistribution[];
  blockNumber: number;
  chainId: number;
  paidAt: Date;
}

export type HistoryRoleFilter = "payer" | "recipient" | "all";

export interface ListTransactionsFilter {
  address: string;
  role: HistoryRoleFilter;
  token?: string;
  limit: number;
  offset: number;
}

export interface TransactionRepository {
  findByTxHash(txHash: string): Promise<TransactionEntity | null>;
  createAndMarkInvoicePaid(
    input: CreateTransactionRecordInput,
    markInvoicePaidRefId: string | null
  ): Promise<TransactionEntity>;
  listByUser(filter: ListTransactionsFilter): Promise<TransactionEntity[]>;
}
