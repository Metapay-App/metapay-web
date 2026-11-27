import { API_ROUTES } from "@/core/constants/api-routes";
import { apiClient } from "@/core/http-client/api-client";
import type { MeIdentityProfile } from "@/client/domain/identity/entity/identity_entity";

export class IdentityRemoteDataSource {
  public async getMeIdentity(address: string): Promise<MeIdentityProfile> {
    const res = await apiClient.get<{ identity: MeIdentityProfile }>(
      API_ROUTES.IDENTITY(address)
    );
    return res.identity;
  }
}
