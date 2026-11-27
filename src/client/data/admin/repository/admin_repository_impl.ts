import type { AdminOverviewData } from "@/client/domain/admin/entity/admin_entity";
import type { AdminRepository } from "@/client/domain/admin/repository/admin_repository";
import type { AdminRemoteDataSource } from "../data_source/admin_remote_data_source";

export class AdminRepositoryImpl implements AdminRepository {
  public constructor(
    private readonly remoteDataSource: AdminRemoteDataSource
  ) {}

  public getOverview(limit?: number): Promise<AdminOverviewData> {
    return this.remoteDataSource.getOverview(limit);
  }
}
