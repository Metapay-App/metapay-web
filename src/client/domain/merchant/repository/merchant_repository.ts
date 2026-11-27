import type {
  MerchantProfile,
  RegisterMerchantResult,
} from "../entity/merchant_entity";

export interface MerchantRepository {
  registerMerchant(
    walletAddress: string,
    name: string
  ): Promise<RegisterMerchantResult>;
  getMerchantByWallet(walletAddress: string): Promise<MerchantProfile | null>;
  getMerchantByApiKey(apiKey: string): Promise<MerchantProfile | null>;
}
