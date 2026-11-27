import { prisma } from "@/server/shared/db/prisma";
import type {
  AdminOverviewDto,
  AdminRepository,
} from "../domain/admin.repository";

export class PrismaAdminRepository implements AdminRepository {
  public async getOverview(limit = 50): Promise<AdminOverviewDto> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const [
      totalMerchants,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      cancelledInvoices,
      expiredInvoices,
      totalTransactions,
      totalHttp402Receipts,
      merchants,
      receipts,
      recentTransactions,
    ] = await Promise.all([
      prisma.merchant.count(),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: "PENDING" } }),
      prisma.invoice.count({ where: { status: "CANCELLED" } }),
      prisma.invoice.count({ where: { status: "EXPIRED" } }),
      prisma.transaction.count(),
      prisma.http402Receipt.count(),
      prisma.merchant.findMany({
        take: safeLimit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      }),
      prisma.http402Receipt.findMany({
        take: safeLimit,
        orderBy: { verifiedAt: "desc" },
      }),
      prisma.transaction.findMany({
        take: safeLimit,
        orderBy: { paidAt: "desc" },
      }),
    ]);

    return {
      stats: {
        totalMerchants,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        cancelledInvoices,
        expiredInvoices,
        totalTransactions,
        totalHttp402Receipts,
      },
      merchants: merchants.map((m) => ({
        id: m.id,
        walletAddress: m.walletAddress,
        meAddress: m.meAddress,
        meId: m.meId,
        name: m.name,
        apiKeyPrefix: m.apiKeyPrefix,
        invoiceCount: m._count.invoices,
        createdAt: m.createdAt.toISOString(),
      })),
      receipts: receipts.map((r) => ({
        id: r.id,
        refId: r.refId,
        txHash: r.txHash,
        endpoint: r.endpoint,
        payerAddress: r.payerAddress,
        verifiedAt: r.verifiedAt.toISOString(),
      })),
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        txHash: t.txHash,
        refId: t.refId,
        payerAddress: t.payerAddress,
        payerMeAddress: t.payerMeAddress,
        recipientAddress: t.recipientAddress,
        payToken: t.payToken,
        payAmount: t.payAmount,
        targetToken: t.targetToken,
        targetAmount: t.targetAmount,
        isSplit: t.isSplit,
        blockNumber: t.blockNumber,
        chainId: t.chainId,
        paidAt: t.paidAt.toISOString(),
      })),
    };
  }
}

export const defaultAdminRepository = new PrismaAdminRepository();
