export interface AdminStatsDto {
  totalMerchants: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  cancelledInvoices: number;
  expiredInvoices: number;
  totalTransactions: number;
  totalHttp402Receipts: number;
}

export interface AdminMerchantItemDto {
  id: string;
  walletAddress: string;
  meAddress: string;
  meId: string | null;
  name: string;
  apiKeyPrefix: string;
  invoiceCount: number;
  createdAt: string;
}

export interface AdminHttp402ReceiptDto {
  id: string;
  refId: string;
  txHash: string;
  endpoint: string;
  payerAddress: string;
  verifiedAt: string;
}

export interface AdminTransactionItemDto {
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
}

export interface AdminOverviewDto {
  stats: AdminStatsDto;
  merchants: AdminMerchantItemDto[];
  receipts: AdminHttp402ReceiptDto[];
  recentTransactions: AdminTransactionItemDto[];
}

export interface AdminRepository {
  getOverview(limit?: number): Promise<AdminOverviewDto>;
}
