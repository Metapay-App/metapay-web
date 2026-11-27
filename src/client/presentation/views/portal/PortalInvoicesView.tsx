"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatBpsToPercent,
  formatDateTime,
  formatTokenDisplay,
  shortenAddress,
} from "@/core/utils/format";
import type { InvoiceStatus } from "@/client/domain/invoice/entity/invoice_entity";
import {
  ConfirmModal,
  CopyButton,
  GlassCard,
  HarborButton,
  HarborInput,
  HarborSelect,
  PaymentVisualTag,
  PortalShell,
  StatusBadge,
  ToastBanner,
} from "@/client/presentation/components";
import { PORTAL_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { usePortal } from "./hooks/usePortal";

export function PortalInvoicesView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    invoices,
    invoicesLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    setSelectedInvoice,
    cancelTarget,
    setCancelTarget,
    cancelling,
    feedback,
    setFeedback,
    fetchInvoices,
    handleConfirmCancelInvoice,
  } = usePortal();

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (inv) =>
        inv.refId.toLowerCase().includes(q) ||
        inv.recipientAddress.toLowerCase().includes(q) ||
        inv.recipientMeAddress.toLowerCase().includes(q) ||
        (inv.description ?? "").toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  return (
    <PortalShell
      lang={lang}
      title={dict.nav.invoices}
      subtitle="Read, filter, inspect checkout QR tags, and cancel open invoices."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <GlassCard className="space-y-4 p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
          <HarborInput
            placeholder={dict.common.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <HarborSelect
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as InvoiceStatus | "ALL")
            }
          >
            <option value="ALL" className="bg-harbor-black">
              All Statuses
            </option>
            <option value="PENDING" className="bg-harbor-black">
              PENDING
            </option>
            <option value="PAID" className="bg-harbor-black">
              PAID
            </option>
            <option value="EXPIRED" className="bg-harbor-black">
              EXPIRED
            </option>
            <option value="CANCELLED" className="bg-harbor-black">
              CANCELLED
            </option>
          </HarborSelect>
          <HarborButton
            variant="glass"
            onClick={() => void fetchInvoices()}
            loading={invoicesLoading}
          >
            {dict.common.refresh}
          </HarborButton>
        </div>

        <div
          id={PORTAL_SEMANTIC_IDS.INVOICES_TABLE}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Ref ID</th>
                <th className="py-3 pr-3">Recipient</th>
                <th className="py-3 pr-3">Target</th>
                <th className="py-3 pr-3">Source</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Created</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[14px] text-harbor-caption"
                  >
                    {invoicesLoading ? dict.common.loading : dict.common.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-harbor-surface/20">
                    <td className="py-3 pr-3 font-mono text-harbor-white">
                      {shortenAddress(inv.refId, 8, 5)}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="block font-mono text-harbor-highlight">
                        {shortenAddress(inv.recipientAddress)}
                      </span>
                      <span className="block font-mono text-[11px] text-harbor-caption">
                        {shortenAddress(inv.recipientMeAddress, 6, 4)}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-bold text-harbor-white">
                      {formatTokenDisplay(inv.targetAmount, inv.targetToken)}
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge tone={inv.source} />
                    </td>
                    <td className="py-3 pr-3">
                      <StatusBadge tone={inv.status} />
                    </td>
                    <td className="py-3 pr-3 text-harbor-secondary">
                      {formatDateTime(inv.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <HarborButton
                          size="sm"
                          variant="glass"
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          QR / Detail
                        </HarborButton>
                        <Link href={PAGE_ROUTES.PAY(lang, inv.refId)}>
                          <HarborButton size="sm" variant="primary">
                            {dict.invoice.openCheckout}
                          </HarborButton>
                        </Link>
                        {inv.status === "PENDING" ? (
                          <HarborButton
                            size="sm"
                            variant="danger"
                            onClick={() => setCancelTarget(inv)}
                          >
                            {dict.common.cancel}
                          </HarborButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {selectedInvoice ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-harbor-black/80 p-4 backdrop-blur-md"
        >
          <div className="glass-card-glow w-full max-w-lg space-y-4 rounded-modal p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-bold text-harbor-white">
                  Invoice Detail & QR Share
                </h2>
                <p className="font-mono text-[12px] text-harbor-caption">
                  {selectedInvoice.refId}
                </p>
              </div>
              <StatusBadge tone={selectedInvoice.status} />
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <PaymentVisualTag
                value={PAGE_ROUTES.PAY(lang, selectedInvoice.refId)}
                size={132}
              />
              <div className="min-w-0 flex-1 space-y-2 text-[13px]">
                <p className="text-[22px] font-extrabold text-harbor-white">
                  {formatTokenDisplay(
                    selectedInvoice.targetAmount,
                    selectedInvoice.targetToken
                  )}
                </p>
                <p className="text-harbor-secondary">
                  Expiry:{" "}
                  {selectedInvoice.expiryType === "NO_LIMIT"
                    ? dict.invoice.expiryTypeNoLimit
                    : formatDateTime(selectedInvoice.expiresAt)}
                </p>
                {selectedInvoice.description ? (
                  <p className="text-harbor-highlight">
                    {selectedInvoice.description}
                  </p>
                ) : null}
                <CopyButton
                  lang={lang}
                  value={`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }${PAGE_ROUTES.PAY(lang, selectedInvoice.refId)}`}
                />
              </div>
            </div>

            {selectedInvoice.splits.length > 0 ? (
              <div className="space-y-1.5 rounded-control border border-harbor-white/10 bg-harbor-black/50 p-3 text-[12px]">
                <p className="font-bold text-harbor-highlight">Splits</p>
                {selectedInvoice.splits.map((s, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="font-mono text-harbor-secondary">
                      {shortenAddress(s.recipient)}
                    </span>
                    <span className="font-bold text-harbor-white">
                      {formatBpsToPercent(s.bps)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <HarborButton
                variant="glass"
                onClick={() => setSelectedInvoice(null)}
              >
                {dict.common.close}
              </HarborButton>
              <Link href={PAGE_ROUTES.PAY(lang, selectedInvoice.refId)}>
                <HarborButton>{dict.invoice.openCheckout}</HarborButton>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={cancelTarget !== null}
        title={dict.invoice.cancelInvoice}
        description={
          cancelTarget
            ? `Cancel pending invoice ${shortenAddress(cancelTarget.refId, 10, 6)}?`
            : ""
        }
        confirmLabel={dict.invoice.confirmCancel}
        cancelLabel={dict.common.close}
        loading={cancelling}
        onConfirm={() => void handleConfirmCancelInvoice()}
        onClose={() => setCancelTarget(null)}
      />
    </PortalShell>
  );
}
