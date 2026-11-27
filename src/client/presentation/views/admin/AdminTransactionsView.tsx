"use client";

import React, { useMemo } from "react";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatDateTime,
  formatTokenDisplay,
  shortenAddress,
} from "@/core/utils/format";
import {
  AdminShell,
  CopyButton,
  GlassCard,
  HarborButton,
  HarborInput,
  ToastBanner,
} from "@/client/presentation/components";
import { ADMIN_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { useAdmin } from "./hooks/useAdmin";

export function AdminTransactionsView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    overview,
    loadingOverview,
    searchQuery,
    setSearchQuery,
    feedback,
    setFeedback,
    fetchOverview,
  } = useAdmin();

  const filtered = useMemo(() => {
    const list = overview?.recentTransactions ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (tx) =>
        tx.txHash.toLowerCase().includes(q) ||
        tx.refId.toLowerCase().includes(q) ||
        tx.payerAddress.toLowerCase().includes(q) ||
        tx.payerMeAddress.toLowerCase().includes(q) ||
        tx.recipientAddress.toLowerCase().includes(q)
    );
  }, [overview, searchQuery]);

  return (
    <AdminShell
      lang={lang}
      title={dict.admin.transactionsTitle}
      subtitle="Inspect every cross-token payment verified across MetaPayGateway."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <GlassCard className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <HarborInput
            placeholder={dict.common.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <HarborButton
            variant="glass"
            loading={loadingOverview}
            onClick={() => void fetchOverview()}
          >
            {dict.common.refresh}
          </HarborButton>
        </div>

        <div
          id={ADMIN_SEMANTIC_IDS.GLOBAL_TX_TABLE}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Tx Hash</th>
                <th className="py-3 pr-3">Ref ID</th>
                <th className="py-3 pr-3">Payer</th>
                <th className="py-3 pr-3">Recipient</th>
                <th className="py-3 pr-3">Paid</th>
                <th className="py-3 pr-3">Settled</th>
                <th className="py-3 pr-3">Split</th>
                <th className="py-3">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-[14px] text-harbor-caption"
                  >
                    {loadingOverview ? dict.common.loading : dict.common.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-harbor-white">
                          {shortenAddress(tx.txHash, 8, 5)}
                        </span>
                        <CopyButton lang={lang} value={tx.txHash} />
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono text-harbor-secondary">
                      {shortenAddress(tx.refId, 7, 4)}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-mono text-harbor-highlight">
                        {shortenAddress(tx.payerAddress)}
                      </span>
                      <span className="block font-mono text-[11px] text-harbor-caption">
                        {shortenAddress(tx.payerMeAddress, 6, 4)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-mono text-harbor-secondary">
                      {shortenAddress(tx.recipientAddress)}
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      {formatTokenDisplay(tx.payAmount, tx.payToken)}
                    </td>
                    <td className="py-3 pr-3 font-bold text-harbor-white">
                      {formatTokenDisplay(tx.targetAmount, tx.targetToken)}
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      {tx.isSplit ? "Split" : "Single"}
                    </td>
                    <td className="py-3 text-harbor-secondary">
                      {formatDateTime(tx.paidAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AdminShell>
  );
}
