import { withMetaPay402 } from "@/server/modules/http402/application/with-metapay-402";
import { ok } from "@/server/shared/http/response";

export const GET = withMetaPay402(
  async (_req, context) => {
    return ok({
      unlocked: true,
      message: "Access granted via Meta Pay HTTP 402 proof verification",
      settlement: {
        refId: context.refId,
        txHash: context.txHash,
        payer: context.payment.payerAddress,
        payerMeAddress: context.payment.payerMeAddress,
        payToken: context.payment.payToken,
        payAmount: context.payment.payAmount,
        targetToken: context.payment.targetToken,
        targetAmount: context.payment.targetAmount,
        splits: context.payment.splits,
      },
      data: {
        feed: "ME Network Cross-Token Liquidity Snapshot",
        generatedAt: new Date().toISOString(),
        ratesUsd: {
          MEC: 0.5,
          mUSDT: 1.0,
          mUSDC: 1.0,
          IDRC: 0.0000625,
        },
      },
    });
  },
  {
    recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    targetToken: "mUSDT",
    targetAmount: "1000000", // 1 mUSDT (6 decimals)
    expirySeconds: 300,
    splits: [
      { recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", bps: 8000 },
      { recipient: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", bps: 2000 },
    ],
    description: "Meta Pay HTTP 402 Demo Premium Analytics API",
  }
);
