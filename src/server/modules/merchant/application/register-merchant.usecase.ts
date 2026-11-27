import { generateApiKey } from "@/server/shared/auth/api-key";
import { lookupMeIdentity } from "@/server/shared/blockchain/me-identity";
import {
  toPublicMerchantDto,
  type PublicMerchantDto,
} from "../domain/merchant.entity";
import type { MerchantRepository } from "../domain/merchant.repository";

export interface RegisterMerchantCommand {
  walletAddress: string;
  name: string;
}

export interface RegisterMerchantResult {
  merchant: PublicMerchantDto;
  apiKey: string;
}

export class RegisterMerchantUseCase {
  constructor(private readonly merchantRepo: MerchantRepository) {}

  public async execute(
    command: RegisterMerchantCommand
  ): Promise<RegisterMerchantResult> {
    const identity = await lookupMeIdentity(command.walletAddress);
    const { plainKey, prefix, hash } = await generateApiKey();

    const entity = await this.merchantRepo.upsertByWallet({
      walletAddress: identity.evmAddress,
      meAddress: identity.meAddress,
      meId: identity.meId,
      name: command.name.trim(),
      apiKeyPrefix: prefix,
      apiKeyHash: hash,
    });

    return {
      merchant: toPublicMerchantDto(entity),
      apiKey: plainKey,
    };
  }
}
