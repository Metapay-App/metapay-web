import { NextRequest } from "next/server";
import { z } from "zod";
import { CancelInvoiceUseCase } from "@/server/modules/invoice/application/cancel-invoice.usecase";
import { defaultInvoiceRepository } from "@/server/modules/invoice/infrastructure/prisma-invoice.repository";
import { AuthenticateMerchantUseCase } from "@/server/modules/merchant/application/authenticate-merchant.usecase";
import { defaultMerchantRepository } from "@/server/modules/merchant/infrastructure/prisma-merchant.repository";
import { handleApiError, ok } from "@/server/shared/http/response";

const refIdParamSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid bytes32 refId");

const cancelBodySchema = z.object({
  actorAddress: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ refId: string }> }
) {
  try {
    const { refId } = await context.params;
    const validRefId = refIdParamSchema.parse(refId);

    const rawBody: unknown = await req.json().catch(() => ({}));
    const parsedBody = cancelBodySchema.parse(rawBody);

    const apiKey = req.headers.get("x-api-key")?.trim();
    let merchantId: string | undefined;
    if (apiKey) {
      const authUseCase = new AuthenticateMerchantUseCase(
        defaultMerchantRepository
      );
      const merchant = await authUseCase.execute(apiKey);
      merchantId = merchant.id;
    }

    const useCase = new CancelInvoiceUseCase(defaultInvoiceRepository);
    const invoice = await useCase.execute({
      refId: validRefId,
      merchantId,
      actorAddress: parsedBody.actorAddress,
    });

    return ok({ invoice });
  } catch (error) {
    return handleApiError(error);
  }
}
