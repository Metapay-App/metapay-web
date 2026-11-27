import { NextRequest } from "next/server";
import { z } from "zod";
import { GetAdminOverviewUseCase } from "@/server/modules/admin/application/get-admin-overview.usecase";
import { defaultAdminRepository } from "@/server/modules/admin/infrastructure/prisma-admin.repository";
import { handleApiError, ok } from "@/server/shared/http/response";

const adminQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export async function GET(req: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = adminQuerySchema.parse(rawQuery);

    const useCase = new GetAdminOverviewUseCase(defaultAdminRepository);
    const overview = await useCase.execute(parsed.limit);
    return ok({ overview });
  } catch (error) {
    return handleApiError(error);
  }
}
