import {
  lookupMeIdentity,
  type MeIdentityInfo,
} from "@/server/shared/blockchain/me-identity";

export class ResolveIdentityUseCase {
  public async execute(address: string): Promise<MeIdentityInfo> {
    return lookupMeIdentity(address);
  }
}

export const defaultResolveIdentityUseCase = new ResolveIdentityUseCase();
