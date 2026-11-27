import { NextRequest } from "next/server";
import { z } from "zod";
import { GetUserTxHistoryUseCase } from "@/server/modules/payment/application/get-user-tx-history.usecase";
import { defaultTransactionRepository } from "@/server/modules/payment/infrastructure/prisma-transaction.repository";
import { handleApiError, ok } from "@/server/shared/http/response";

const historyQuerySchema = z.object({
  address: z.string().min(1),
  role: z.enum(["payer", "recipient", "all"]).optional().default("all"),
  token: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = historyQuerySchema.parse(rawQuery);

    const useCase = new GetUserTxHistoryUseCase(defaultTransactionRepository);
    const transactions = await useCase.execute(parsed);
    return ok({ transactions });
  } catch (error) {
    return handleApiError(error);
  }
}
