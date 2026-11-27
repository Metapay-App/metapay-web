import { prisma } from "@/server/shared/db/prisma";
import type { MerchantEntity } from "../domain/merchant.entity";
import type {
  MerchantRepository,
  UpsertMerchantInput,
} from "../domain/merchant.repository";

export class PrismaMerchantRepository implements MerchantRepository {
  public async findById(id: string): Promise<MerchantEntity | null> {
    return prisma.merchant.findUnique({ where: { id } });
  }

  public async findByWalletAddress(
    walletAddress: string
  ): Promise<MerchantEntity | null> {
    return prisma.merchant.findUnique({ where: { walletAddress } });
  }

  public async findByApiKeyPrefix(
    prefix: string
  ): Promise<MerchantEntity | null> {
    return prisma.merchant.findUnique({ where: { apiKeyPrefix: prefix } });
  }

  public async upsertByWallet(
    input: UpsertMerchantInput
  ): Promise<MerchantEntity> {
    return prisma.merchant.upsert({
      where: { walletAddress: input.walletAddress },
      create: {
        walletAddress: input.walletAddress,
        meAddress: input.meAddress,
        meId: input.meId,
        name: input.name,
        apiKeyPrefix: input.apiKeyPrefix,
        apiKeyHash: input.apiKeyHash,
      },
      update: {
        meAddress: input.meAddress,
        meId: input.meId,
        name: input.name,
        apiKeyPrefix: input.apiKeyPrefix,
        apiKeyHash: input.apiKeyHash,
      },
    });
  }
}

export const defaultMerchantRepository = new PrismaMerchantRepository();
