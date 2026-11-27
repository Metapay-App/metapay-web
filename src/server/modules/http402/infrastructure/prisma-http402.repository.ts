import { prisma } from "@/server/shared/db/prisma";
import type {
  CreateHttp402ReceiptInput,
  Http402ReceiptEntity,
  Http402Repository,
} from "../domain/http402.repository";

export class PrismaHttp402Repository implements Http402Repository {
  public async findByRefIdOrTxHash(
    refId: string,
    txHash: string
  ): Promise<Http402ReceiptEntity | null> {
    return prisma.http402Receipt.findFirst({
      where: {
        OR: [{ refId }, { txHash }],
      },
    });
  }

  public async createReceipt(
    input: CreateHttp402ReceiptInput
  ): Promise<Http402ReceiptEntity> {
    return prisma.http402Receipt.create({
      data: {
        refId: input.refId,
        txHash: input.txHash,
        endpoint: input.endpoint,
        payerAddress: input.payerAddress,
      },
    });
  }
}

export const defaultHttp402Repository = new PrismaHttp402Repository();
