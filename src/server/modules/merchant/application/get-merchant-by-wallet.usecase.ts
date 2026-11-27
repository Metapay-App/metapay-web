import { normalizeToEvmAndMe } from "@/core/utils/address";
import { BadRequestError, NotFoundError } from "@/server/shared/errors/app-error";
import {
  toPublicMerchantDto,
  type PublicMerchantDto,
} from "../domain/merchant.entity";
import type { MerchantRepository } from "../domain/merchant.repository";

export class GetMerchantByWalletUseCase {
  constructor(private readonly merchantRepo: MerchantRepository) {}

  public async execute(walletInput: string): Promise<PublicMerchantDto> {
    let evmAddress: string;
    try {
      evmAddress = normalizeToEvmAndMe(walletInput).evmAddress;
    } catch (err) {
      throw new BadRequestError(
        err instanceof Error ? err.message : "Invalid wallet address",
        "INVALID_ADDRESS"
      );
    }

    const merchant = await this.merchantRepo.findByWalletAddress(evmAddress);
    if (!merchant) {
      throw new NotFoundError("Merchant not found", "MERCHANT_NOT_FOUND");
    }

    return toPublicMerchantDto(merchant);
  }
}
