import type { MerchantEntity } from "./merchant.entity";

export interface UpsertMerchantInput {
  walletAddress: string;
  meAddress: string;
  meId: string | null;
  name: string;
  apiKeyPrefix: string;
  apiKeyHash: string;
}

export interface MerchantRepository {
  findById(id: string): Promise<MerchantEntity | null>;
  findByWalletAddress(walletAddress: string): Promise<MerchantEntity | null>;
  findByApiKeyPrefix(prefix: string): Promise<MerchantEntity | null>;
  upsertByWallet(input: UpsertMerchantInput): Promise<MerchantEntity>;
}
