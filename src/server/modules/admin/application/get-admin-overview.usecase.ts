import type {
  AdminOverviewDto,
  AdminRepository,
} from "../domain/admin.repository";

export class GetAdminOverviewUseCase {
  public constructor(private readonly adminRepository: AdminRepository) {}

  public async execute(limit = 50): Promise<AdminOverviewDto> {
    return this.adminRepository.getOverview(limit);
  }
}
