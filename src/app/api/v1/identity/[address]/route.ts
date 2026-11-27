import { NextRequest } from "next/server";
import { defaultResolveIdentityUseCase } from "@/server/modules/identity/application/resolve-identity.usecase";
import { handleApiError, ok } from "@/server/shared/http/response";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await context.params;
    const identity = await defaultResolveIdentityUseCase.execute(address);
    return ok({ identity });
  } catch (error) {
    return handleApiError(error);
  }
}
