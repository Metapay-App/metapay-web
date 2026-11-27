import {
  extractApiKeyPrefix,
  verifyApiKey,
} from "@/server/shared/auth/api-key";
import { UnauthorizedError } from "@/server/shared/errors/app-error";
import {
  toPublicMerchantDto,
  type PublicMerchantDto,
} from "../domain/merchant.entity";
import type { MerchantRepository } from "../domain/merchant.repository";

export class AuthenticateMerchantUseCase {
  constructor(private readonly merchantRepo: MerchantRepository) {}

  public async execute(apiKey: string): Promise<PublicMerchantDto> {
    const prefix = extractApiKeyPrefix(apiKey);
    if (!prefix) {
      throw new UnauthorizedError("Invalid API key format", "INVALID_API_KEY");
    }

    const merchant = await this.merchantRepo.findByApiKeyPrefix(prefix);
    if (!merchant) {
      throw new UnauthorizedError("Invalid API key", "INVALID_API_KEY");
    }

    const isValid = await verifyApiKey(apiKey, merchant.apiKeyHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid API key", "INVALID_API_KEY");
    }

    return toPublicMerchantDto(merchant);
  }
}
