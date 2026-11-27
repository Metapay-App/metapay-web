import type { MeIdentityProfile } from "../entity/identity_entity";

export interface IdentityRepository {
  getMeIdentity(address: string): Promise<MeIdentityProfile>;
}
