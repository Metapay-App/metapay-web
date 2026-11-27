"use client";

import React from "react";
import { TOKEN_LIST, type TokenSymbol } from "@/core/constants/contracts";
import { getDictionary, type Locale } from "@/core/translator";
import { formatTokenDisplay } from "@/core/utils/format";
import {
  GlassCard,
  HarborButton,
  HarborSelect,
  PortalShell,
  StatusBadge,
  ToastBanner,
} from "@/client/presentation/components";
import { PORTAL_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { PORTAL_TEXT_CONSTANTS } from "./constants/TextConstant";
import { usePortal } from "./hooks/usePortal";

export function PortalPlaygroundView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    http402Response,
    http402PaySymbol,
    setHttp402PaySymbol,
    http402Loading,
    handleRequestHttp402Challenge,
    handleSettleHttp402AndUnlock,
    feedback,
    setFeedback,
  } = usePortal();

  return (
    <PortalShell
      lang={lang}
      title={dict.http402.title}
      subtitle={dict.http402.subtitle}
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <div
        id={PORTAL_SEMANTIC_IDS.PLAYGROUND_PANEL}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Endpoint: GET /api/v1/demo/premium-data
            </h2>
            {http402Response ? (
              <StatusBadge tone={String(http402Response.statusCode) as "402" | "200"} />
            ) : null}
          </div>

          <p className="text-[14px] text-harbor-secondary">
            Step 1 requests the paywalled endpoint without proof headers and
            receives an HTTP 402 invoice challenge. Step 2 settles with any token
            on-chain and automatically retries with proof headers.
          </p>

          <HarborButton
            size="lg"
            variant="glass"
            className="w-full"
            loading={http402Loading}
            onClick={() => void handleRequestHttp402Challenge()}
          >
            {dict.http402.triggerRequest}
          </HarborButton>

          {http402Response?.statusCode === 402 && http402Response.challenge ? (
            <div className="space-y-4 border-t border-harbor-white/10 pt-4">
              <div className="rounded-control border border-harbor-brand-blue/50 bg-harbor-brand-blue/20 p-3 text-[13px]">
                <p className="font-bold text-harbor-white">
                  {dict.http402.paymentRequired}
                </p>
                <p className="mt-1 text-harbor-highlight">
                  Required:{" "}
                  {formatTokenDisplay(
                    http402Response.challenge.targetAmount,
                    http402Response.challenge.targetToken
                  )}
                </p>
              </div>

              <HarborSelect
                label={dict.payment.payWithToken}
                value={http402PaySymbol}
                onChange={(e) =>
                  setHttp402PaySymbol(e.target.value as TokenSymbol)
                }
              >
                {TOKEN_LIST.map((t) => (
                  <option
                    key={t.symbol}
                    value={t.symbol}
                    className="bg-harbor-black"
                  >
                    {t.symbol} — {t.name}
                  </option>
                ))}
              </HarborSelect>

              <HarborButton
                size="lg"
                className="w-full"
                loading={http402Loading}
                onClick={() => void handleSettleHttp402AndUnlock()}
              >
                {dict.http402.settleAndRetry}
              </HarborButton>
            </div>
          ) : null}

          <div className="space-y-1.5 rounded-control border border-harbor-white/10 bg-harbor-black/60 p-3.5 text-[12px]">
            <p className="font-bold text-harbor-highlight">
              {dict.http402.receiptTitle}
            </p>
            {PORTAL_TEXT_CONSTANTS.HTTP_402_HEADERS_EXAMPLE.map((line) => (
              <p key={line} className="font-mono text-harbor-caption">
                {line}
              </p>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="glow" className="space-y-4 p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[18px] font-bold text-harbor-white">
              Live Response Payload
            </h2>
            {http402Response?.statusCode === 200 ? (
              <StatusBadge tone="200" label={dict.http402.unlocked} />
            ) : null}
          </div>

          <pre className="max-h-[460px] overflow-auto rounded-control border border-harbor-white/10 bg-harbor-black/75 p-4 font-mono text-[12px] leading-relaxed text-harbor-highlight">
            {http402Response
              ? JSON.stringify(http402Response, null, 2)
              : "// Click \"1. Request Protected API\" to inspect the live HTTP 402 response."}
          </pre>
        </GlassCard>
      </div>
    </PortalShell>
  );
}
