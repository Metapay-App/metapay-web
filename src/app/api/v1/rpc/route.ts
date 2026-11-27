import { NextRequest } from "next/server";
import { z } from "zod";
import {
  BadRequestError,
  BlockchainError,
} from "@/server/shared/errors/app-error";
import { handleApiError, ok } from "@/server/shared/http/response";

const ALLOWED_RPC_METHODS = new Set<string>([
  "eth_chainId",
  "eth_blockNumber",
  "eth_getBalance",
  "eth_call",
  "eth_estimateGas",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_getTransactionCount",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_getLogs",
  "eth_getCode",
  "eth_sendRawTransaction",
  "net_version",
]);

const rpcRequestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string().min(1),
  params: z.array(z.unknown()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = rpcRequestSchema.parse(body);

    if (!ALLOWED_RPC_METHODS.has(parsed.method)) {
      throw new BadRequestError(
        `RPC method "${parsed.method}" is not permitted`,
        "RPC_METHOD_NOT_ALLOWED"
      );
    }

    const rpcUrl = process.env.ME_TESTNET_RPC_URL || "http://118.175.0.249:8545";

    let upstreamRes: Response;
    try {
      upstreamRes = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
        cache: "no-store",
      });
    } catch (err) {
      throw new BlockchainError(
        `Upstream EVM RPC unreachable: ${
          err instanceof Error ? err.message : String(err)
        }`,
        "RPC_UNREACHABLE"
      );
    }

    if (!upstreamRes.ok) {
      throw new BlockchainError(
        `Upstream EVM RPC returned HTTP ${upstreamRes.status}`,
        "RPC_UPSTREAM_ERROR"
      );
    }

    const rpcPayload: unknown = await upstreamRes.json();
    return ok(rpcPayload);
  } catch (error) {
    return handleApiError(error);
  }
}
