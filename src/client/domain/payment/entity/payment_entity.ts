export interface SplitDistributionItem {
  recipient: string;
  amount: string;
}

export interface TransactionItem {
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
  splits: SplitDistributionItem[];
  blockNumber: number;
  chainId: number;
  paidAt: string;
  createdAt: string;
}
