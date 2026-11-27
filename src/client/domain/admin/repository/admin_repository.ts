import type { AdminOverviewData } from "../entity/admin_entity";

export interface AdminRepository {
  getOverview(limit?: number): Promise<AdminOverviewData>;
}
