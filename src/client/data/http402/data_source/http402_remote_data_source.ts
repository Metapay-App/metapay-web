import { API_ROUTES } from "@/core/constants/api-routes";
import { ApiClientError } from "@/core/http-client/api-client";
import type {
  Http402ChallengePayment,
  Http402DemoResponse,
} from "@/client/domain/http402/entity/http402_entity";
import type { Http402ProofHeader } from "@/client/domain/http402/repository/http402_repository";

export class Http402RemoteDataSource {
  public async requestDemo(
    proof?: Http402ProofHeader
  ): Promise<Http402DemoResponse> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (proof) {
      headers["x-metapay-ref"] = proof.refId;
      headers["x-metapay-tx"] = proof.txHash;
    }

    const response = await fetch(API_ROUTES.DEMO_PREMIUM_DATA, {
      method: "GET",
      headers,
    });
    const text = await response.text();
    const parsed: unknown = text ? JSON.parse(text) : {};

    if (response.status === 402) {
      const challengePayload = parsed as {
        message?: string;
        payment?: Http402ChallengePayment;
      };
      return {
        statusCode: 402,
        message: challengePayload.message ?? "Payment Required",
        challenge: challengePayload.payment,
      };
    }

    if (!response.ok) {
      const errObj =
        parsed && typeof parsed === "object"
          ? (parsed as { code?: string; message?: string; details?: unknown })
          : {};
      throw new ApiClientError(
        response.status,
        errObj.code ?? "HTTP_402_ERROR",
        errObj.message ?? `Demo endpoint failed (${response.status})`,
        errObj.details
      );
    }

    return {
      statusCode: 200,
      message: "Access granted",
      unlockedPayload: parsed as Http402DemoResponse["unlockedPayload"],
    };
  }
}
