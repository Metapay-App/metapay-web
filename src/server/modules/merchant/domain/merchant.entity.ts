export interface MerchantEntity {
  id: string;
  walletAddress: string;
  meAddress: string;
  meId: string | null;
  name: string;
  apiKeyPrefix: string;
  apiKeyHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicMerchantDto {
  id: string;
  walletAddress: string;
  meAddress: string;
  meId: string | null;
  name: string;
  apiKeyPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export function toPublicMerchantDto(entity: MerchantEntity): PublicMerchantDto {
  return {
    id: entity.id,
    walletAddress: entity.walletAddress,
    meAddress: entity.meAddress,
    meId: entity.meId,
    name: entity.name,
    apiKeyPrefix: entity.apiKeyPrefix,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
