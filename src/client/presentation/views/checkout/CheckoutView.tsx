"use client";

import React from "react";
import Link from "next/link";
import { TOKEN_LIST, type TokenSymbol } from "@/core/constants/contracts";
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
  CopyButton,
  GlassCard,
  HarborButton,
  HarborSelect,
  PaymentVisualTag,
  PublicNavbar,
  StatusBadge,
  ToastBanner,
  TokenPill,
} from "@/client/presentation/components";
import { CHECKOUT_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { useCheckout } from "./hooks/useCheckout";

export function CheckoutView({
  lang,
  refId,
}: {
  lang: Locale;
  refId: string;
}) {
  const dict = getDictionary(lang);
  const {
    address,
    isWrongNetwork,
    balances,
    invoice,
    recipientIdentity,
    loadingInvoice,
    invoiceError,
    paySymbol,
    setPaySymbol,
    selectedPayToken,
    quotedDisplay,
    quoteLoading,
    submitting,
    txError,
    verifiedTx,
    handlePayNow,
  } = useCheckout(refId);

  const checkoutUrl =
    typeof window !== "undefined" ? window.location.href : PAGE_ROUTES.PAY(lang, refId);

  return (
    <div className="harbor-canvas min-h-screen">
      <PublicNavbar lang={lang} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[25px] font-extrabold text-harbor-white">
              Meta Pay Checkout
            </h1>
            <p className="text-[14px] text-harbor-secondary">
              Atomic Cross-Token Settlement · Ref {shortenAddress(refId, 10, 6)}
            </p>
          </div>
          <Link href={PAGE_ROUTES.PORTAL_INVOICES(lang)}>
            <HarborButton variant="glass" size="sm">
              ← {dict.nav.invoices}
            </HarborButton>
          </Link>
        </div>

        {loadingInvoice ? (
          <GlassCard className="p-8 text-center text-[14px] text-harbor-secondary">
            {dict.common.loading}
          </GlassCard>
        ) : invoiceError || !invoice ? (
          <ToastBanner
            tone="error"
            message={invoiceError ?? "Invoice not found"}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <GlassCard
              variant="glow"
              className="space-y-5 p-6"
            >
              <div
                id={CHECKOUT_SEMANTIC_IDS.SUMMARY_CARD}
                className="flex flex-wrap items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[12px] text-harbor-caption">
                    {dict.invoice.targetAmountLabel}
                  </span>
                  <p className="mt-1 text-[28px] font-extrabold text-harbor-white">
                    {formatTokenDisplay(invoice.targetAmount, invoice.targetToken)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={invoice.source} />
                  <StatusBadge tone={invoice.status} />
                </div>
              </div>

              {invoice.description ? (
                <p className="rounded-control border border-harbor-white/10 bg-harbor-black/45 p-3 text-[14px] text-harbor-highlight">
                  {invoice.description}
                </p>
              ) : null}

              <div className="space-y-3 rounded-control border border-harbor-white/10 bg-harbor-black/55 p-4 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-harbor-caption">Invoice Ref ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-harbor-white">
                      {shortenAddress(invoice.refId, 10, 6)}
                    </span>
                    <CopyButton lang={lang} value={invoice.refId} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-harbor-caption">Recipient (0x)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-harbor-white">
                      {shortenAddress(invoice.recipientAddress)}
                    </span>
                    <CopyButton lang={lang} value={invoice.recipientAddress} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-harbor-caption">Recipient (me1)</span>
                  <span className="font-mono text-harbor-secondary">
                    {shortenAddress(invoice.recipientMeAddress, 8, 6)}
                  </span>
                </div>

                {recipientIdentity?.hasMeId ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-harbor-caption">{dict.payment.meIdVerified}</span>
                    <span className="rounded-chip bg-harbor-blue/35 px-2 py-0.5 text-[11px] font-bold text-harbor-white">
                      ME ID: {recipientIdentity.meId}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-harbor-caption">Target Asset</span>
                  <TokenPill tokenAddressOrSymbol={invoice.targetToken} />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-harbor-caption">Expiry Policy</span>
                  <span className="text-harbor-white">
                    {invoice.expiryType === "NO_LIMIT"
                      ? dict.invoice.expiryTypeNoLimit
                      : formatDateTime(invoice.expiresAt)}
                  </span>
                </div>
              </div>

              {invoice.splits.length > 0 ? (
                <div className="space-y-2">
                  <h2 className="text-[14px] font-bold text-harbor-highlight">
                    Multi-Recipient Split Breakdown
                  </h2>
                  <div className="space-y-1.5">
                    {invoice.splits.map((s, idx) => (
                      <div
                        key={`${s.recipient}-${idx}`}
                        className="flex items-center justify-between rounded-control border border-harbor-white/10 bg-harbor-black/45 px-3 py-2 text-[12px]"
                      >
                        <span className="font-mono text-harbor-secondary">
                          {shortenAddress(s.recipient)}
                        </span>
                        <span className="font-bold text-harbor-white">
                          {formatBpsToPercent(s.bps)} ({s.bps} bps)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col items-center gap-3 border-t border-harbor-white/10 pt-4 sm:flex-row">
                <PaymentVisualTag value={checkoutUrl} size={112} />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[13px] font-bold text-harbor-white">
                    Shareable Checkout Link
                  </p>
                  <p className="truncate font-mono text-[12px] text-harbor-caption">
                    {checkoutUrl}
                  </p>
                  <CopyButton lang={lang} value={checkoutUrl} />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-5 p-6">
              <div id={CHECKOUT_SEMANTIC_IDS.PAYER_BOX} className="space-y-4">
                <h2 className="text-[18px] font-bold text-harbor-white">
                  {dict.payment.payWithToken}
                </h2>

                {txError ? <ToastBanner tone="error" message={txError} /> : null}

                {verifiedTx ? (
                  <ToastBanner
                    tone="success"
                    message={dict.payment.paymentSuccess}
                  />
                ) : null}

                <HarborSelect
                  label={dict.payment.payWithToken}
                  value={paySymbol}
                  disabled={invoice.status !== "PENDING" || submitting}
                  onChange={(e) => setPaySymbol(e.target.value as TokenSymbol)}
                >
                  {TOKEN_LIST.map((token) => {
                    const rawBal = balances[token.symbol];
                    const balFormatted = rawBal
                      ? formatTokenAmount(
                          rawBal,
                          token.decimals,
                          token.decimals === 2 ? 2 : 4
                        )
                      : "0";
                    return (
                      <option
                        key={token.symbol}
                        value={token.symbol}
                        className="bg-harbor-black"
                      >
                        {token.symbol} — Balance: {balFormatted}
                      </option>
                    );
                  })}
                </HarborSelect>

                <div className="rounded-control border border-harbor-glow/40 bg-harbor-black/65 p-4">
                  <span className="block text-[12px] text-harbor-caption">
                    {dict.payment.estimatedPay}
                  </span>
                  <p className="mt-1 text-[24px] font-extrabold text-harbor-white">
                    {quoteLoading ? dict.common.loading : quotedDisplay}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-harbor-secondary">
                    {dict.payment.maxSlippageNote}
                  </p>
                </div>

                {invoice.status !== "PENDING" ? (
                  <ToastBanner
                    tone="info"
                    message={`${dict.payment.invoiceUnavailable} (${invoice.status})`}
                  />
                ) : (
                  <HarborButton
                    size="lg"
                    className="w-full"
                    loading={submitting}
                    onClick={() => void handlePayNow()}
                  >
                    {!address
                      ? dict.common.connectWallet
                      : isWrongNetwork
                        ? dict.common.switchNetwork
                        : selectedPayToken.isNative
                          ? dict.payment.payNow
                          : dict.payment.approveAndPay}
                  </HarborButton>
                )}

                {verifiedTx ? (
                  <div
                    id={CHECKOUT_SEMANTIC_IDS.RECEIPT_CARD}
                    className="space-y-2 rounded-control border border-harbor-glow/45 bg-harbor-blue/15 p-4 text-[13px]"
                  >
                    <p className="font-bold text-harbor-white">
                      Verified Settlement Receipt
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-harbor-caption">Tx Hash</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-harbor-white">
                          {shortenAddress(verifiedTx.txHash)}
                        </span>
                        <CopyButton lang={lang} value={verifiedTx.txHash} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-harbor-caption">Paid Amount</span>
                      <span className="font-bold text-harbor-white">
                        {formatTokenDisplay(
                          verifiedTx.payAmount,
                          verifiedTx.payToken
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-harbor-caption">Block</span>
                      <span className="text-harbor-white">
                        #{verifiedTx.blockNumber}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
}
