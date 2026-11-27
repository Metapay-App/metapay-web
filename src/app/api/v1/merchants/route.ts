import { NextRequest } from "next/server";
import { z } from "zod";
import { RegisterMerchantUseCase } from "@/server/modules/merchant/application/register-merchant.usecase";
import { defaultMerchantRepository } from "@/server/modules/merchant/infrastructure/prisma-merchant.repository";
import { created, handleApiError } from "@/server/shared/http/response";

const registerMerchantSchema = z.object({
  walletAddress: z.string().min(1),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = registerMerchantSchema.parse(body);
    const useCase = new RegisterMerchantUseCase(defaultMerchantRepository);
    const result = await useCase.execute(parsed);
    return created(result);
  } catch (error) {
    return handleApiError(error);
  }
}
