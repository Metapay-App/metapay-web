import type { AdminOverviewData } from "../entity/admin_entity";
import type { AdminRepository } from "../repository/admin_repository";

export class GetAdminOverviewUseCase {
  public constructor(private readonly repository: AdminRepository) {}

  public execute(limit?: number): Promise<AdminOverviewData> {
    return this.repository.getOverview(limit);
  }
}
