export interface Http402ReceiptEntity {
  id: string;
  refId: string;
  txHash: string;
  endpoint: string;
  payerAddress: string;
  verifiedAt: Date;
}

export interface CreateHttp402ReceiptInput {
  refId: string;
  txHash: string;
  endpoint: string;
  payerAddress: string;
}

export interface Http402Repository {
  findByRefIdOrTxHash(
    refId: string,
    txHash: string
  ): Promise<Http402ReceiptEntity | null>;
  createReceipt(input: CreateHttp402ReceiptInput): Promise<Http402ReceiptEntity>;
}
