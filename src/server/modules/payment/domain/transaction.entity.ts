import type { VerifiedSplitDistribution } from "@/server/shared/blockchain/evm-client";

export interface TransactionEntity {
  id: string;
  txHash: string;
  refId: string;
  invoiceId: string | null;
  payerAddress: string;
  payerMeAddress: string;
  recipientAddress: string;
  payToken: string;
  payAmount: string;
  targetToken: string;
  targetAmount: string;
  isSplit: boolean;
  splits: VerifiedSplitDistribution[];
  blockNumber: number;
  chainId: number;
  paidAt: Date;
  createdAt: Date;
}

export interface TransactionDto {
  id: string;
  txHash: string;
  refId: string;
  invoiceId: string | null;
  payerAddress: string;
  payerMeAddress: string;
  recipientAddress: string;
  payToken: string;
  payAmount: string;
  targetToken: string;
  targetAmount: string;
  isSplit: boolean;
  splits: VerifiedSplitDistribution[];
  blockNumber: number;
  chainId: number;
  paidAt: string;
  createdAt: string;
}

export function toTransactionDto(entity: TransactionEntity): TransactionDto {
  return {
    id: entity.id,
    txHash: entity.txHash,
    refId: entity.refId,
    invoiceId: entity.invoiceId,
    payerAddress: entity.payerAddress,
    payerMeAddress: entity.payerMeAddress,
    recipientAddress: entity.recipientAddress,
    payToken: entity.payToken,
    payAmount: entity.payAmount,
    targetToken: entity.targetToken,
    targetAmount: entity.targetAmount,
    isSplit: entity.isSplit,
    splits: entity.splits,
    blockNumber: entity.blockNumber,
    chainId: entity.chainId,
    paidAt: entity.paidAt.toISOString(),
    createdAt: entity.createdAt.toISOString(),
  };
}
