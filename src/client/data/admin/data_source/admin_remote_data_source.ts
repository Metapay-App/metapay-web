import { API_ROUTES } from "@/core/constants/api-routes";
import { apiClient } from "@/core/http-client/api-client";
import { buildQueryString } from "@/core/http-client/query";
import type { AdminOverviewData } from "@/client/domain/admin/entity/admin_entity";

export class AdminRemoteDataSource {
  public async getOverview(limit = 50): Promise<AdminOverviewData> {
    const res = await apiClient.get<{ overview: AdminOverviewData }>(
      `${API_ROUTES.ADMIN_OVERVIEW}${buildQueryString({ limit })}`
    );
    return res.overview;
  }
}
