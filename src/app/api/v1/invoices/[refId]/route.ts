import { NextRequest } from "next/server";
import { z } from "zod";
import { GetInvoiceUseCase } from "@/server/modules/invoice/application/get-invoice.usecase";
import { defaultInvoiceRepository } from "@/server/modules/invoice/infrastructure/prisma-invoice.repository";
import { handleApiError, ok } from "@/server/shared/http/response";

const refIdParamSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid bytes32 refId");

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ refId: string }> }
) {
  try {
    const { refId } = await context.params;
    const validRefId = refIdParamSchema.parse(refId);
    const useCase = new GetInvoiceUseCase(defaultInvoiceRepository);
    const invoice = await useCase.execute(validRefId);
    return ok({ invoice });
  } catch (error) {
    return handleApiError(error);
  }
}
