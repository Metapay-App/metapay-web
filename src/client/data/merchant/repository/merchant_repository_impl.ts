import type {
  MerchantProfile,
  RegisterMerchantResult,
} from "@/client/domain/merchant/entity/merchant_entity";
import type { MerchantRepository } from "@/client/domain/merchant/repository/merchant_repository";
import type { MerchantRemoteDataSource } from "../data_source/merchant_remote_data_source";

export class MerchantRepositoryImpl implements MerchantRepository {
  public constructor(
    private readonly remoteDataSource: MerchantRemoteDataSource
  ) {}

  public registerMerchant(
    walletAddress: string,
    name: string
  ): Promise<RegisterMerchantResult> {
    return this.remoteDataSource.registerMerchant(walletAddress, name);
  }

  public getMerchantByWallet(
    walletAddress: string
  ): Promise<MerchantProfile | null> {
    return this.remoteDataSource.getMerchantByWallet(walletAddress);
  }

  public getMerchantByApiKey(apiKey: string): Promise<MerchantProfile | null> {
    return this.remoteDataSource.getMerchantByApiKey(apiKey);
  }
}
