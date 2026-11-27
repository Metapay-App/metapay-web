import type { TransactionItem } from "@/client/domain/payment/entity/payment_entity";
import type {
  ListHistoryParams,
  PaymentRepository,
} from "@/client/domain/payment/repository/payment_repository";
import type { PaymentRemoteDataSource } from "../data_source/payment_remote_data_source";

export class PaymentRepositoryImpl implements PaymentRepository {
  public constructor(
    private readonly remoteDataSource: PaymentRemoteDataSource
  ) {}

  public verifyPayment(
    refId: string,
    txHash: string
  ): Promise<TransactionItem> {
    return this.remoteDataSource.verifyPayment(refId, txHash);
  }

  public getTxHistory(params: ListHistoryParams): Promise<TransactionItem[]> {
    return this.remoteDataSource.getTxHistory(params);
  }
}
