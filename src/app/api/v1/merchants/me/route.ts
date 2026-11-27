import { NextRequest } from "next/server";
import { AuthenticateMerchantUseCase } from "@/server/modules/merchant/application/authenticate-merchant.usecase";
import { GetMerchantByWalletUseCase } from "@/server/modules/merchant/application/get-merchant-by-wallet.usecase";
import { defaultMerchantRepository } from "@/server/modules/merchant/infrastructure/prisma-merchant.repository";
import { UnauthorizedError } from "@/server/shared/errors/app-error";
import { handleApiError, ok } from "@/server/shared/http/response";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("x-api-key")?.trim();
    if (apiKey) {
      const authUseCase = new AuthenticateMerchantUseCase(
        defaultMerchantRepository
      );
      const merchant = await authUseCase.execute(apiKey);
      return ok({ merchant });
    }

    const walletAddress = req.nextUrl.searchParams.get("walletAddress")?.trim();
    if (walletAddress) {
      const walletUseCase = new GetMerchantByWalletUseCase(
        defaultMerchantRepository
      );
      const merchant = await walletUseCase.execute(walletAddress);
      return ok({ merchant });
    }

    throw new UnauthorizedError(
      "Provide x-api-key header or walletAddress query parameter",
      "UNAUTHORIZED"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
