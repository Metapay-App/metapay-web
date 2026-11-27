"use client";

import React, { useMemo } from "react";
import { getDictionary, type Locale } from "@/core/translator";
import { formatDateTime, shortenAddress } from "@/core/utils/format";
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

export function AdminMerchantsView({ lang }: { lang: Locale }) {
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

  const filteredMerchants = useMemo(() => {
    const list = overview?.merchants ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.walletAddress.toLowerCase().includes(q) ||
        m.meAddress.toLowerCase().includes(q) ||
        m.apiKeyPrefix.toLowerCase().includes(q)
    );
  }, [overview, searchQuery]);

  const filteredReceipts = useMemo(() => {
    const list = overview?.receipts ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.refId.toLowerCase().includes(q) ||
        r.txHash.toLowerCase().includes(q) ||
        r.endpoint.toLowerCase().includes(q) ||
        r.payerAddress.toLowerCase().includes(q)
    );
  }, [overview, searchQuery]);

  return (
    <AdminShell
      lang={lang}
      title={dict.nav.adminMerchants}
      subtitle="Audit registered merchants, API key prefixes, and HTTP 402 replay-protected verification receipts."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

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

      <GlassCard className="space-y-4 p-6">
        <h2 className="text-[18px] font-bold text-harbor-white">
          {dict.admin.merchantsTitle}
        </h2>
        <div
          id={ADMIN_SEMANTIC_IDS.MERCHANTS_TABLE}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[700px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Name</th>
                <th className="py-3 pr-3">Wallet (0x / me1)</th>
                <th className="py-3 pr-3">ME ID</th>
                <th className="py-3 pr-3">API Prefix</th>
                <th className="py-3 pr-3">Invoices</th>
                <th className="py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-[14px] text-harbor-caption"
                  >
                    {dict.common.noData}
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 pr-3 font-bold text-harbor-white">
                      {m.name}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-mono text-harbor-highlight">
                        {shortenAddress(m.walletAddress)}
                      </span>
                      <span className="block font-mono text-[11px] text-harbor-caption">
                        {shortenAddress(m.meAddress, 6, 4)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      {m.meId ?? "—"}
                    </td>
                    <td className="py-3 pr-3 font-mono text-harbor-white">
                      {m.apiKeyPrefix}...
                    </td>
                    <td className="py-3 pr-3 font-bold text-harbor-white">
                      {m.invoiceCount}
                    </td>
                    <td className="py-3 text-harbor-secondary">
                      {formatDateTime(m.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <h2 className="text-[18px] font-bold text-harbor-white">
          {dict.admin.receiptsTitle}
        </h2>
        <div
          id={ADMIN_SEMANTIC_IDS.RECEIPTS_TABLE}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[700px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Ref ID</th>
                <th className="py-3 pr-3">Tx Hash</th>
                <th className="py-3 pr-3">Endpoint</th>
                <th className="py-3 pr-3">Payer</th>
                <th className="py-3">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-[14px] text-harbor-caption"
                  >
                    {dict.common.noData}
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-3 font-mono text-harbor-white">
                      {shortenAddress(r.refId, 8, 5)}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-harbor-highlight">
                          {shortenAddress(r.txHash, 8, 5)}
                        </span>
                        <CopyButton lang={lang} value={r.txHash} />
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono text-harbor-secondary">
                      {r.endpoint}
                    </td>
                    <td className="py-3 pr-3 font-mono text-harbor-secondary">
                      {shortenAddress(r.payerAddress)}
                    </td>
                    <td className="py-3 text-harbor-secondary">
                      {formatDateTime(r.verifiedAt)}
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
