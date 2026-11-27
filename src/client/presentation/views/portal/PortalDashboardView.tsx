"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { TOKEN_LIST, type TokenSymbol } from "@/core/constants/contracts";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatTokenAmount,
  formatTokenDisplay,
  shortenAddress,
} from "@/core/utils/format";
import {
  CopyButton,
  GlassCard,
  HarborButton,
  HarborInput,
  HarborSelect,
  HarborTextarea,
  PaymentVisualTag,
  PortalShell,
  StatusBadge,
  ToastBanner,
  TokenPill,
} from "@/client/presentation/components";
import { PORTAL_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { PORTAL_TEXT_CONSTANTS } from "./constants/TextConstant";
import { usePortal } from "./hooks/usePortal";

export function PortalDashboardView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    address,
    balances,
    invoices,
    feedback,
    setFeedback,
    fetchInvoices,
    recipientInput,
    setRecipientInput,
    targetSymbol,
    setTargetSymbol,
    amountInput,
    setAmountInput,
    expiryType,
    setExpiryType,
    expirySeconds,
    setExpirySeconds,
    descriptionInput,
    setDescriptionInput,
    enableSplits,
    setEnableSplits,
    splitRows,
    setSplitRows,
    creatingInvoice,
    createdInvoice,
    handleCreateInvoice,
  } = usePortal();

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;

  return (
    <PortalShell
      lang={lang}
      title={dict.portal.title}
      subtitle={dict.portal.overviewSubtitle}
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {TOKEN_LIST.map((token) => {
          const raw = balances[token.symbol] ?? "0";
          return (
            <GlassCard key={token.symbol} className="space-y-2 p-4">
              <TokenPill tokenAddressOrSymbol={token.symbol} />
              <p className="text-[20px] font-extrabold text-harbor-white">
                {address
                  ? formatTokenAmount(
                      raw,
                      token.decimals,
                      token.decimals === 2 ? 2 : 4
                    )
                  : "—"}
              </p>
              <span className="block text-[12px] text-harbor-caption">
                {token.name}
              </span>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="p-5">
          <span className="text-[12px] text-harbor-caption">
            Total Invoices Loaded
          </span>
          <p className="mt-1 text-[25px] font-extrabold text-harbor-white">
            {invoices.length}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <span className="text-[12px] text-harbor-caption">
            Pending Settlement
          </span>
          <p className="mt-1 text-[25px] font-extrabold text-harbor-highlight">
            {pendingCount}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <span className="text-[12px] text-harbor-caption">
            Paid On-Chain
          </span>
          <p className="mt-1 text-[25px] font-extrabold text-harbor-blue">
            {paidCount}
          </p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-6">
          <form
            id={PORTAL_SEMANTIC_IDS.CREATE_INVOICE_FORM}
            onSubmit={handleCreateInvoice}
            className="space-y-4"
          >
            <h2 className="text-[21px] font-bold text-harbor-white">
              {dict.invoice.createTitle}
            </h2>

            <HarborInput
              label={dict.invoice.recipientLabel}
              placeholder="0x... or me1..."
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HarborSelect
                label={dict.invoice.targetTokenLabel}
                value={targetSymbol}
                onChange={(e) => setTargetSymbol(e.target.value as TokenSymbol)}
              >
                {TOKEN_LIST.map((t) => (
                  <option key={t.symbol} value={t.symbol} className="bg-harbor-black">
                    {t.symbol} — {t.name}
                  </option>
                ))}
              </HarborSelect>

              <HarborInput
                label={dict.invoice.targetAmountLabel}
                type="number"
                step="any"
                min="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <HarborSelect
                label="Expiry Policy"
                value={expiryType}
                onChange={(e) =>
                  setExpiryType(e.target.value as "FIXED" | "NO_LIMIT")
                }
              >
                <option value="FIXED" className="bg-harbor-black">
                  {dict.invoice.expiryTypeFixed}
                </option>
                <option value="NO_LIMIT" className="bg-harbor-black">
                  {dict.invoice.expiryTypeNoLimit}
                </option>
              </HarborSelect>

              {expiryType === "FIXED" ? (
                <HarborSelect
                  label="Duration"
                  value={String(expirySeconds)}
                  onChange={(e) =>
                    setExpirySeconds(Number.parseInt(e.target.value, 10))
                  }
                >
                  {PORTAL_TEXT_CONSTANTS.EXPIRY_PRESETS.map((preset) => (
                    <option
                      key={preset.seconds}
                      value={String(preset.seconds)}
                      className="bg-harbor-black"
                    >
                      {preset.label}
                    </option>
                  ))}
                </HarborSelect>
              ) : null}
            </div>

            <div className="rounded-control border border-harbor-white/10 bg-harbor-black/45 p-4">
              <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-semibold text-harbor-white">
                <input
                  type="checkbox"
                  checked={enableSplits}
                  onChange={(e) => setEnableSplits(e.target.checked)}
                  className="h-4 w-4 accent-harbor-blue"
                />
                <span>{dict.invoice.splitPaymentLabel}</span>
              </label>

              {enableSplits ? (
                <div className="mt-4 space-y-2.5">
                  {splitRows.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_auto]"
                    >
                      <input
                        className="glass-input px-3 py-2 text-[13px]"
                        placeholder="0x... or me1..."
                        value={row.recipient}
                        onChange={(e) =>
                          setSplitRows((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? { ...item, recipient: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        className="glass-input px-3 py-2 text-[13px]"
                        placeholder="BPS (e.g. 5000)"
                        value={row.bps}
                        onChange={(e) =>
                          setSplitRows((prev) =>
                            prev.map((item, i) =>
                              i === index ? { ...item, bps: e.target.value } : item
                            )
                          )
                        }
                      />
                      <HarborButton
                        size="sm"
                        variant="glass"
                        disabled={splitRows.length <= 2}
                        onClick={() =>
                          setSplitRows((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ✕
                      </HarborButton>
                    </div>
                  ))}
                  {splitRows.length < 10 ? (
                    <HarborButton
                      size="sm"
                      variant="glass"
                      onClick={() =>
                        setSplitRows((prev) => [
                          ...prev,
                          { recipient: "", bps: "0" },
                        ])
                      }
                    >
                      + {dict.invoice.addSplit}
                    </HarborButton>
                  ) : null}
                </div>
              ) : null}
            </div>

            <HarborTextarea
              label={dict.invoice.descriptionLabel}
              rows={2}
              placeholder="e.g. Order #1042 or AI Inference Top-up"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
            />

            <HarborButton
              type="submit"
              size="lg"
              className="w-full"
              loading={creatingInvoice}
            >
              {dict.invoice.createTitle}
            </HarborButton>
          </form>
        </GlassCard>

        <GlassCard variant="glow" className="flex flex-col justify-between gap-4 p-6">
          <div className="space-y-3">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Checkout Preview & Quick Share
            </h2>
            {createdInvoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] text-harbor-highlight">
                    {shortenAddress(createdInvoice.refId, 10, 6)}
                  </span>
                  <StatusBadge tone={createdInvoice.status} />
                </div>
                <p className="text-[24px] font-extrabold text-harbor-white">
                  {formatTokenDisplay(
                    createdInvoice.targetAmount,
                    createdInvoice.targetToken
                  )}
                </p>
                <div className="flex justify-center py-2">
                  <PaymentVisualTag
                    value={PAGE_ROUTES.PAY(lang, createdInvoice.refId)}
                    size={136}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={PAGE_ROUTES.PAY(lang, createdInvoice.refId)}
                    className="flex-1"
                  >
                    <HarborButton className="w-full">
                      {dict.invoice.openCheckout}
                    </HarborButton>
                  </Link>
                  <CopyButton
                    lang={lang}
                    value={`${
                      typeof window !== "undefined" ? window.location.origin : ""
                    }${PAGE_ROUTES.PAY(lang, createdInvoice.refId)}`}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[14px] leading-relaxed text-harbor-secondary">
                Submit the form on the left to generate a live shareable Meta Pay
                checkout page with automatic cross-token swap support.
              </p>
            )}
          </div>

          <div className="border-t border-harbor-white/10 pt-3">
            <Link
              href={PAGE_ROUTES.PORTAL_INVOICES(lang)}
              className="text-[13px] font-semibold text-harbor-highlight hover:text-harbor-white"
            >
              {dict.nav.invoices} →
            </Link>
          </div>
        </GlassCard>
      </div>
    </PortalShell>
  );
}
