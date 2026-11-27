import type { TransactionItem } from "../entity/payment_entity";
import type {
  ListHistoryParams,
  PaymentRepository,
} from "../repository/payment_repository";

export class VerifyPaymentUseCase {
  public constructor(private readonly repository: PaymentRepository) {}

  public execute(refId: string, txHash: string): Promise<TransactionItem> {
    return this.repository.verifyPayment(refId, txHash);
  }
}

export class GetTxHistoryUseCase {
  public constructor(private readonly repository: PaymentRepository) {}

  public execute(params: ListHistoryParams): Promise<TransactionItem[]> {
    return this.repository.getTxHistory(params);
  }
}
