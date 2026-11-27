import type { TransactionItem } from "../entity/payment_entity";

export interface ListHistoryParams {
  address: string;
  role?: "payer" | "recipient" | "all";
  token?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentRepository {
  verifyPayment(refId: string, txHash: string): Promise<TransactionItem>;
  getTxHistory(params: ListHistoryParams): Promise<TransactionItem[]>;
}
