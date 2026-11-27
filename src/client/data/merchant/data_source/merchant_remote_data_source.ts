import { API_ROUTES } from "@/core/constants/api-routes";
import { ApiClientError, apiClient } from "@/core/http-client/api-client";
import { buildQueryString } from "@/core/http-client/query";
import type {
  MerchantProfile,
  RegisterMerchantResult,
} from "@/client/domain/merchant/entity/merchant_entity";

export class MerchantRemoteDataSource {
  public async registerMerchant(
    walletAddress: string,
    name: string
  ): Promise<RegisterMerchantResult> {
    return apiClient.post<RegisterMerchantResult>(API_ROUTES.MERCHANTS, {
      walletAddress,
      name,
    });
  }

  public async getMerchantByWallet(
    walletAddress: string
  ): Promise<MerchantProfile | null> {
    try {
      const res = await apiClient.get<{ merchant: MerchantProfile }>(
        `${API_ROUTES.MERCHANT_ME}${buildQueryString({ walletAddress })}`
      );
      return res.merchant;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public async getMerchantByApiKey(
    apiKey: string
  ): Promise<MerchantProfile | null> {
    try {
      const res = await apiClient.get<{ merchant: MerchantProfile }>(
        API_ROUTES.MERCHANT_ME,
        { headers: { "x-api-key": apiKey } }
      );
      return res.merchant;
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        (error.status === 401 || error.status === 404)
      ) {
        return null;
      }
      throw error;
    }
  }
}
