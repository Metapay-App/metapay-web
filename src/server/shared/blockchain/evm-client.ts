import { Interface, JsonRpcProvider, getAddress } from "ethers";
import {
  CHAIN_CONFIG,
  CONTRACT_ABIS,
  CONTRACT_ADDRESSES,
} from "@/core/constants/contracts";
import { BlockchainError, ConflictError } from "../errors/app-error";

export interface VerifiedSplitDistribution {
  recipient: string;
  token: string;
  amount: string;
}

export interface VerifiedOnChainPayment {
  txHash: string;
  refId: string;
  payer: string;
  recipient: string;
  payToken: string;
  payAmount: string;
  targetToken: string;
  targetAmount: string;
  paidAt: Date;
  isSplit: boolean;
  splits: VerifiedSplitDistribution[];
  blockNumber: number;
  chainId: number;
}

export interface OnChainPaymentVerifier {
  verifySettledPayment(
    txHash: string,
    expectedRefId: string
  ): Promise<VerifiedOnChainPayment>;
}

function getRpcUrl(): string {
  return process.env.ME_TESTNET_RPC_URL || "http://118.175.0.249:8545";
}

export function createEvmProvider(): JsonRpcProvider {
  return new JsonRpcProvider(getRpcUrl());
}

export class EvmOnChainPaymentVerifier implements OnChainPaymentVerifier {
  private readonly gatewayInterface = new Interface(CONTRACT_ABIS.MetaPayGateway);

  public async verifySettledPayment(
    txHash: string,
    expectedRefId: string
  ): Promise<VerifiedOnChainPayment> {
    const provider = createEvmProvider();

    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(txHash);
    } catch (error) {
      throw new BlockchainError(
        `Failed to fetch transaction receipt from RPC: ${
          error instanceof Error ? error.message : String(error)
        }`,
        "RPC_FETCH_FAILED"
      );
    }

    if (!receipt) {
      throw new ConflictError(
        "Transaction receipt not found or still pending",
        "TX_NOT_MINED"
      );
    }

    if (receipt.status !== 1) {
      throw new ConflictError(
        "On-chain transaction reverted",
        "TX_REVERTED"
      );
    }

    const gatewayAddr = CONTRACT_ADDRESSES.gateway.toLowerCase();
    const expectedRefLower = expectedRefId.toLowerCase();

    let settled: {
      refId: string;
      payer: string;
      recipient: string;
      payToken: string;
      payAmount: string;
      targetToken: string;
      targetAmount: string;
      paidAt: Date;
      isSplit: boolean;
    } | null = null;

    const splits: VerifiedSplitDistribution[] = [];

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== gatewayAddr) {
        continue;
      }
      try {
        const parsed = this.gatewayInterface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
        if (!parsed) continue;

        if (parsed.name === "PaymentSettled") {
          const eventRefId = String(parsed.args.refId);
          if (eventRefId.toLowerCase() === expectedRefLower) {
            settled = {
              refId: eventRefId,
              payer: getAddress(String(parsed.args.payer)),
              recipient: getAddress(String(parsed.args.recipient)),
              payToken: getAddress(String(parsed.args.payToken)),
              payAmount: BigInt(parsed.args.payAmount).toString(),
              targetToken: getAddress(String(parsed.args.targetToken)),
              targetAmount: BigInt(parsed.args.targetAmount).toString(),
              paidAt: new Date(Number(parsed.args.paidAt) * 1000),
              isSplit: Boolean(parsed.args.isSplit),
            };
          }
        } else if (parsed.name === "SplitDistributed") {
          const eventRefId = String(parsed.args.refId);
          if (eventRefId.toLowerCase() === expectedRefLower) {
            splits.push({
              recipient: getAddress(String(parsed.args.recipient)),
              token: getAddress(String(parsed.args.token)),
              amount: BigInt(parsed.args.amount).toString(),
            });
          }
        }
      } catch {
        // Ignore unrelated logs that fail ABI parsing
      }
    }

    if (!settled) {
      throw new ConflictError(
        "No matching PaymentSettled event found in transaction logs",
        "PAYMENT_EVENT_NOT_FOUND"
      );
    }

    return {
      txHash: receipt.hash,
      refId: settled.refId,
      payer: settled.payer,
      recipient: settled.recipient,
      payToken: settled.payToken,
      payAmount: settled.payAmount,
      targetToken: settled.targetToken,
      targetAmount: settled.targetAmount,
      paidAt: settled.paidAt,
      isSplit: settled.isSplit,
      splits,
      blockNumber: receipt.blockNumber,
      chainId: CHAIN_CONFIG.chainId,
    };
  }
}

export const defaultOnChainPaymentVerifier = new EvmOnChainPaymentVerifier();
