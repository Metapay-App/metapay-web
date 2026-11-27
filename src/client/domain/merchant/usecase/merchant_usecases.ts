import type {
  MerchantProfile,
  RegisterMerchantResult,
} from "../entity/merchant_entity";
import type { MerchantRepository } from "../repository/merchant_repository";

export class RegisterMerchantUseCase {
  public constructor(private readonly repository: MerchantRepository) {}

  public execute(
    walletAddress: string,
    name: string
  ): Promise<RegisterMerchantResult> {
    return this.repository.registerMerchant(walletAddress, name);
  }
}

export class GetMerchantByWalletUseCase {
  public constructor(private readonly repository: MerchantRepository) {}

  public execute(walletAddress: string): Promise<MerchantProfile | null> {
    return this.repository.getMerchantByWallet(walletAddress);
  }
}

export class GetMerchantByApiKeyUseCase {
  public constructor(private readonly repository: MerchantRepository) {}

  public execute(apiKey: string): Promise<MerchantProfile | null> {
    return this.repository.getMerchantByApiKey(apiKey);
  }
}
