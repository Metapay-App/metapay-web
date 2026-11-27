export interface AdminOverviewData {
  stats: {
    totalMerchants: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    cancelledInvoices: number;
    expiredInvoices: number;
    totalTransactions: number;
    totalHttp402Receipts: number;
  };
  merchants: Array<{
    id: string;
    walletAddress: string;
    meAddress: string;
    meId: string | null;
    name: string;
    apiKeyPrefix: string;
    invoiceCount: number;
    createdAt: string;
  }>;
  receipts: Array<{
    id: string;
    refId: string;
    txHash: string;
    endpoint: string;
    payerAddress: string;
    verifiedAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    txHash: string;
    refId: string;
    payerAddress: string;
    payerMeAddress: string;
    recipientAddress: string;
    payToken: string;
    payAmount: string;
    targetToken: string;
    targetAmount: string;
    isSplit: boolean;
    blockNumber: number;
    chainId: number;
    paidAt: string;
  }>;
}
