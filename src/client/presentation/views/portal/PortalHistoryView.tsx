"use client";

import React, { useEffect } from "react";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatDateTime,
  formatTokenDisplay,
  shortenAddress,
} from "@/core/utils/format";
import {
  CopyButton,
  GlassCard,
  HarborButton,
  HarborSelect,
  PortalShell,
  ToastBanner,
} from "@/client/presentation/components";
import { PORTAL_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { usePortal } from "./hooks/usePortal";

export function PortalHistoryView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    address,
    transactions,
    historyLoading,
    historyRole,
    setHistoryRole,
    fetchHistory,
    feedback,
    setFeedback,
  } = usePortal();

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return (
    <PortalShell
      lang={lang}
      title={dict.nav.history}
      subtitle="Per-wallet settled transactions synced from PaymentSettled events on Chain 400."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {!address ? (
        <ToastBanner tone="info" message={dict.common.walletRequired} />
      ) : null}

      <GlassCard className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-56">
            <HarborSelect
              label="Role Filter"
              value={historyRole}
              onChange={(e) =>
                setHistoryRole(e.target.value as "all" | "payer" | "recipient")
              }
            >
              <option value="all" className="bg-harbor-black">
                All Roles (Payer & Recipient)
              </option>
              <option value="payer" className="bg-harbor-black">
                As Payer
              </option>
              <option value="recipient" className="bg-harbor-black">
                As Recipient
              </option>
            </HarborSelect>
          </div>

          <HarborButton
            variant="glass"
            onClick={() => void fetchHistory()}
            loading={historyLoading}
            disabled={!address}
          >
            {dict.common.refresh}
          </HarborButton>
        </div>

        <div id={PORTAL_SEMANTIC_IDS.HISTORY_TABLE} className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Tx Hash</th>
                <th className="py-3 pr-3">Payer (0x / me1)</th>
                <th className="py-3 pr-3">Paid</th>
                <th className="py-3 pr-3">Settled Target</th>
                <th className="py-3 pr-3">Block</th>
                <th className="py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-[14px] text-harbor-caption"
                  >
                    {historyLoading ? dict.common.loading : dict.common.noData}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-harbor-surface/20">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-harbor-white">
                          {shortenAddress(tx.txHash, 8, 5)}
                        </span>
                        <CopyButton lang={lang} value={tx.txHash} />
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-mono text-harbor-highlight">
                        {shortenAddress(tx.payerAddress)}
                      </span>
                      <span className="block font-mono text-[11px] text-harbor-caption">
                        {shortenAddress(tx.payerMeAddress, 6, 4)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      {formatTokenDisplay(tx.payAmount, tx.payToken)}
                    </td>
                    <td className="py-3 pr-3 font-bold text-harbor-white">
                      {formatTokenDisplay(tx.targetAmount, tx.targetToken)}
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      #{tx.blockNumber}
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
    </PortalShell>
  );
}
