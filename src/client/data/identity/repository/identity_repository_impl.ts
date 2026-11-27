import type { MeIdentityProfile } from "@/client/domain/identity/entity/identity_entity";
import type { IdentityRepository } from "@/client/domain/identity/repository/identity_repository";
import type { IdentityRemoteDataSource } from "../data_source/identity_remote_data_source";

export class IdentityRepositoryImpl implements IdentityRepository {
  public constructor(
    private readonly remoteDataSource: IdentityRemoteDataSource
  ) {}

  public getMeIdentity(address: string): Promise<MeIdentityProfile> {
    return this.remoteDataSource.getMeIdentity(address);
  }
}
