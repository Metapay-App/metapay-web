import type { ExpiryType } from "@/client/domain/invoice/entity/invoice_entity";
import type { SplitDistributionItem } from "@/client/domain/payment/entity/payment_entity";

export interface Http402ChallengePayment {
  refId: string;
  chainId: number;
  gatewayAddress: string;
  recipient: string;
  recipientMeAddress: string;
  targetToken: string;
  targetTokenSymbol: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt: string | null;
  splits: Array<{ recipient: string; bps: number }>;
  checkoutUrl: string;
}

export interface Http402DemoResponse {
  statusCode: 402 | 200;
  challenge?: Http402ChallengePayment;
  message: string;
  unlockedPayload?: {
    unlocked: boolean;
    message: string;
    settlement: {
      refId: string;
      txHash: string;
      payer: string;
      payerMeAddress: string;
      payToken: string;
      payAmount: string;
      targetToken: string;
      targetAmount: string;
      splits: SplitDistributionItem[];
    };
    data: {
      feed: string;
      generatedAt: string;
      ratesUsd: Record<string, number>;
    };
  };
}
