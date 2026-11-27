import { API_ROUTES } from "@/core/constants/api-routes";
import { apiClient } from "@/core/http-client/api-client";
import { buildQueryString } from "@/core/http-client/query";
import type { TransactionItem } from "@/client/domain/payment/entity/payment_entity";
import type { ListHistoryParams } from "@/client/domain/payment/repository/payment_repository";

export class PaymentRemoteDataSource {
  public async verifyPayment(
    refId: string,
    txHash: string
  ): Promise<TransactionItem> {
    const res = await apiClient.post<{ transaction: TransactionItem }>(
      API_ROUTES.PAYMENTS_VERIFY,
      { refId, txHash }
    );
    return res.transaction;
  }

  public async getTxHistory(
    params: ListHistoryParams
  ): Promise<TransactionItem[]> {
    const query = buildQueryString({
      address: params.address,
      role: params.role,
      token: params.token,
      limit: params.limit,
      offset: params.offset,
    });
    const res = await apiClient.get<{ transactions: TransactionItem[] }>(
      `${API_ROUTES.PAYMENTS_HISTORY}${query}`
    );
    return res.transactions;
  }
}
