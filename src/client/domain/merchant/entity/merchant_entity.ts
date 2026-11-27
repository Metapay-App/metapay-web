export interface MerchantProfile {
  id: string;
  walletAddress: string;
  meAddress: string;
  meId: string | null;
  name: string;
  apiKeyPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterMerchantResult {
  merchant: MerchantProfile;
  apiKey: string;
}
