"use client";

import React from "react";
import Link from "next/link";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatBpsToPercent,
  formatDateTime,
  formatTokenAmount,
  formatTokenDisplay,
  shortenAddress,
} from "@/core/utils/format";
import {
  AdminShell,
  GlassCard,
  HarborButton,
  ToastBanner,
  TokenPill,
} from "@/client/presentation/components";
import { ADMIN_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { useAdmin } from "./hooks/useAdmin";

export function AdminOverviewView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    overview,
    loadingOverview,
    routerSnapshot,
    feedback,
    setFeedback,
    fetchOverview,
    fetchRouter,
  } = useAdmin();

  const stats = overview?.stats;

  const kpiCards = [
    { label: "Registered Merchants", value: stats?.totalMerchants ?? 0 },
    { label: "Total Invoices", value: stats?.totalInvoices ?? 0 },
    { label: "Paid Invoices", value: stats?.paidInvoices ?? 0 },
    { label: "Pending Invoices", value: stats?.pendingInvoices ?? 0 },
    { label: "On-Chain Settlements", value: stats?.totalTransactions ?? 0 },
    { label: "HTTP 402 Receipts", value: stats?.totalHttp402Receipts ?? 0 },
  ];

  return (
    <AdminShell
      lang={lang}
      title={dict.admin.title}
      subtitle={dict.admin.overviewSubtitle}
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <div className="flex justify-end gap-2">
        <HarborButton
          size="sm"
          variant="glass"
          loading={loadingOverview}
          onClick={() => {
            void fetchOverview();
            void fetchRouter();
          }}
        >
          {dict.common.refresh}
        </HarborButton>
      </div>

      <section
        id={ADMIN_SEMANTIC_IDS.OVERVIEW_KPIS}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {kpiCards.map((card) => (
          <GlassCard key={card.label} className="p-5">
            <span className="text-[12px] text-harbor-caption">
              {card.label}
            </span>
            <p className="mt-1 text-[28px] font-extrabold text-harbor-white">
              {loadingOverview && !overview ? "—" : card.value}
            </p>
          </GlassCard>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Router Reserves & Pricing
            </h2>
            <Link href={PAGE_ROUTES.ADMIN_ROUTER(lang)}>
              <HarborButton size="sm" variant="glass">
                {dict.nav.adminRouter} →
              </HarborButton>
            </Link>
          </div>

          <div className="rounded-control border border-harbor-white/10 bg-harbor-black/55 p-3.5 text-[13px]">
            <div className="flex justify-between">
              <span className="text-harbor-caption">Swap Fee</span>
              <span className="font-bold text-harbor-white">
                {routerSnapshot
                  ? `${routerSnapshot.swapFeeBps} bps (${formatBpsToPercent(
                      routerSnapshot.swapFeeBps
                    )})`
                  : "—"}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between">
              <span className="text-harbor-caption">Owner</span>
              <span className="font-mono text-harbor-secondary">
                {routerSnapshot ? shortenAddress(routerSnapshot.ownerAddress) : "—"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {(routerSnapshot?.tokens ?? []).map((entry) => (
              <div
                key={entry.token.symbol}
                className="flex items-center justify-between rounded-control border border-harbor-white/10 bg-harbor-black/45 px-3.5 py-2.5 text-[13px]"
              >
                <TokenPill tokenAddressOrSymbol={entry.token.symbol} />
                <div className="text-right">
                  <span className="block font-bold text-harbor-white">
                    {formatTokenAmount(
                      entry.routerLiquidity,
                      entry.token.decimals,
                      entry.token.decimals === 2 ? 2 : 4
                    )}{" "}
                    {entry.token.symbol}
                  </span>
                  <span className="block text-[11px] text-harbor-caption">
                    ${formatTokenAmount(entry.priceUsdE18, 18, 6)} USD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Latest Global Settlements
            </h2>
            <Link href={PAGE_ROUTES.ADMIN_TRANSACTIONS(lang)}>
              <HarborButton size="sm" variant="glass">
                {dict.nav.adminTransactions} →
              </HarborButton>
            </Link>
          </div>

          <div className="space-y-2">
            {(overview?.recentTransactions ?? []).slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-control border border-harbor-white/10 bg-harbor-black/45 px-3.5 py-2.5 text-[13px]"
              >
                <div className="min-w-0">
                  <span className="block font-mono font-bold text-harbor-white">
                    {shortenAddress(tx.txHash, 8, 5)}
                  </span>
                  <span className="block text-[11px] text-harbor-caption">
                    {formatDateTime(tx.paidAt)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-harbor-highlight">
                    {formatTokenDisplay(tx.targetAmount, tx.targetToken)}
                  </span>
                  <span className="block text-[11px] text-harbor-caption">
                    Paid {formatTokenDisplay(tx.payAmount, tx.payToken)}
                  </span>
                </div>
              </div>
            ))}
            {(overview?.recentTransactions ?? []).length === 0 ? (
              <p className="py-6 text-center text-[14px] text-harbor-caption">
                {dict.common.noData}
              </p>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  );
}
