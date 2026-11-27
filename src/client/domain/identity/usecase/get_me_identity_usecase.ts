import type { MeIdentityProfile } from "../entity/identity_entity";
import type { IdentityRepository } from "../repository/identity_repository";

export class GetMeIdentityUseCase {
  public constructor(private readonly repository: IdentityRepository) {}

  public execute(address: string): Promise<MeIdentityProfile> {
    return this.repository.getMeIdentity(address);
  }
}
