import { NextRequest } from "next/server";
import { z } from "zod";
import { CreateInvoiceUseCase } from "@/server/modules/invoice/application/create-invoice.usecase";
import { ListInvoicesUseCase } from "@/server/modules/invoice/application/list-invoices.usecase";
import { defaultInvoiceRepository } from "@/server/modules/invoice/infrastructure/prisma-invoice.repository";
import { AuthenticateMerchantUseCase } from "@/server/modules/merchant/application/authenticate-merchant.usecase";
import { defaultMerchantRepository } from "@/server/modules/merchant/infrastructure/prisma-merchant.repository";
import { created, handleApiError, ok } from "@/server/shared/http/response";

const splitSchema = z.object({
  recipient: z.string().min(1),
  bps: z.number().int().positive().max(10000),
});

const createInvoiceSchema = z.object({
  recipient: z.string().min(1),
  targetToken: z.string().min(1),
  targetAmount: z.string().min(1),
  expiryType: z.enum(["FIXED", "NO_LIMIT"]),
  expiresAt: z.string().datetime().nullable().optional(),
  expirySeconds: z.number().int().positive().nullable().optional(),
  splits: z.array(splitSchema).max(10).optional(),
  description: z.string().max(500).nullable().optional(),
});

const listInvoicesQuerySchema = z.object({
  merchantId: z.string().optional(),
  recipient: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "EXPIRED", "CANCELLED"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = createInvoiceSchema.parse(body);

    const apiKey = req.headers.get("x-api-key")?.trim();
    let merchantId: string | null = null;
    if (apiKey) {
      const authUseCase = new AuthenticateMerchantUseCase(
        defaultMerchantRepository
      );
      const merchant = await authUseCase.execute(apiKey);
      merchantId = merchant.id;
    }

    const useCase = new CreateInvoiceUseCase(defaultInvoiceRepository);
    const invoice = await useCase.execute({
      ...parsed,
      merchantId,
      source: apiKey ? "API" : "DASHBOARD",
    });

    return created({ invoice });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = listInvoicesQuerySchema.parse(rawQuery);

    const apiKey = req.headers.get("x-api-key")?.trim();
    let merchantId = parsed.merchantId;
    if (apiKey) {
      const authUseCase = new AuthenticateMerchantUseCase(
        defaultMerchantRepository
      );
      const merchant = await authUseCase.execute(apiKey);
      merchantId = merchant.id;
    }

    const useCase = new ListInvoicesUseCase(defaultInvoiceRepository);
    const invoices = await useCase.execute({
      merchantId,
      recipient: parsed.recipient,
      status: parsed.status,
      limit: parsed.limit,
      offset: parsed.offset,
    });

    return ok({ invoices });
  } catch (error) {
    return handleApiError(error);
  }
}
