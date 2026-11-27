"use client";

import React from "react";
import Link from "next/link";
import { TOKEN_LIST, type TokenSymbol } from "@/core/constants/contracts";
import { PAGE_ROUTES } from "@/core/constants/page-routes";
import { getDictionary, type Locale } from "@/core/translator";
import {
  GlassCard,
  HarborButton,
  HarborInput,
  HarborSelect,
  PublicNavbar,
  TokenPill,
} from "@/client/presentation/components";
import { PUBLIC_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { PUBLIC_TEXT_CONSTANTS } from "./constants/TextConstant";
import { usePublic } from "./hooks/usePublic";

export function PublicHomeView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    paySymbol,
    setPaySymbol,
    targetSymbol,
    setTargetSymbol,
    targetAmountInput,
    setTargetAmountInput,
    quotedPayDisplay,
    quoteLoading,
    quoteError,
    runLiveQuote,
  } = usePublic();

  return (
    <div className="harbor-canvas min-h-screen">
      <PublicNavbar lang={lang} />

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        <section
          id={PUBLIC_SEMANTIC_IDS.HERO_SECTION}
          className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_0.9fr]"
        >
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-badge border border-harbor-glow/45 bg-harbor-blue/20 px-3.5 py-1 text-[12px] font-bold text-harbor-highlight">
              {dict.publicSite.heroBadge}
            </span>

            <h1 className="text-[31px] font-extrabold leading-tight tracking-tight text-harbor-white sm:text-[38px]">
              {dict.publicSite.heroTitle}
            </h1>

            <p className="max-w-2xl text-[15px] leading-relaxed text-harbor-secondary">
              {dict.publicSite.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href={PAGE_ROUTES.PORTAL(lang)}>
                <HarborButton size="lg" variant="primary">
                  {dict.publicSite.ctaPortal}
                </HarborButton>
              </Link>
              <Link href={PAGE_ROUTES.PORTAL_PLAYGROUND(lang)}>
                <HarborButton size="lg" variant="glass">
                  {dict.publicSite.ctaPlayground}
                </HarborButton>
              </Link>
              <Link href={PAGE_ROUTES.ADMIN(lang)}>
                <HarborButton size="lg" variant="glass">
                  {dict.publicSite.ctaAdmin}
                </HarborButton>
              </Link>
            </div>
          </div>

          <GlassCard
            variant="glow"
            className="p-6"
          >
            <div
              id={PUBLIC_SEMANTIC_IDS.QUOTE_SIMULATOR}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[18px] font-bold text-harbor-white">
                  Live Cross-Token Quote
                </h2>
                <span className="rounded-chip border border-harbor-glow/40 bg-harbor-blue/25 px-2.5 py-0.5 text-[11px] font-bold text-harbor-white">
                  Chain 400
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <HarborSelect
                  label={dict.payment.payWithToken}
                  value={paySymbol}
                  onChange={(e) => setPaySymbol(e.target.value as TokenSymbol)}
                >
                  {TOKEN_LIST.map((t) => (
                    <option key={t.symbol} value={t.symbol} className="bg-harbor-black">
                      {t.symbol} — {t.name}
                    </option>
                  ))}
                </HarborSelect>

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
              </div>

              <HarborInput
                label={dict.invoice.targetAmountLabel}
                type="number"
                step="any"
                min="0"
                value={targetAmountInput}
                onChange={(e) => setTargetAmountInput(e.target.value)}
              />

              <div className="rounded-control border border-harbor-glow/40 bg-harbor-black/65 p-4">
                <span className="block text-[12px] text-harbor-caption">
                  MetaPayGateway.quotePayment()
                </span>
                <p className="mt-1 text-[22px] font-extrabold text-harbor-white">
                  {quoteLoading ? dict.common.loading : quotedPayDisplay}
                </p>
                {quoteError ? (
                  <p className="mt-1 text-[12px] text-harbor-secondary">
                    {quoteError}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-2">
                <HarborButton
                  size="sm"
                  variant="glass"
                  onClick={() => void runLiveQuote()}
                  loading={quoteLoading}
                >
                  {dict.common.refresh}
                </HarborButton>
                <Link
                  href={PAGE_ROUTES.ABOUT(lang)}
                  className="text-[12px] font-semibold text-harbor-highlight hover:text-harbor-white"
                >
                  {dict.nav.about} →
                </Link>
              </div>
            </div>
          </GlassCard>
        </section>

        <section
          id={PUBLIC_SEMANTIC_IDS.TOKEN_SHOWCASE}
          className="space-y-4"
        >
          <h2 className="text-[21px] font-bold text-harbor-white">
            {dict.publicSite.supportedTokensTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TOKEN_LIST.map((token) => (
              <GlassCard
                key={token.symbol}
                className="flex flex-col justify-between gap-3 p-4 hover:border-harbor-glow/55"
              >
                <div className="flex items-center justify-between">
                  <TokenPill tokenAddressOrSymbol={token.symbol} />
                  <span className="text-[11px] font-bold text-harbor-caption">
                    {token.isNative ? "Native" : "ERC-20"}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-harbor-white">
                    {token.name}
                  </p>
                  <p className="mt-1 truncate text-[12px] text-harbor-caption">
                    {token.address}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section
          id={PUBLIC_SEMANTIC_IDS.FEATURES_GRID}
          className="space-y-4"
        >
          <h2 className="text-[21px] font-bold text-harbor-white">
            {dict.publicSite.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PUBLIC_TEXT_CONSTANTS.CORE_CAPABILITIES.map((cap) => (
              <GlassCard
                key={cap.title}
                className="space-y-3 p-6 hover:border-harbor-glow/60"
              >
                <span className="inline-block rounded-badge border border-harbor-glow/40 bg-harbor-blue/20 px-2.5 py-0.5 text-[12px] font-bold text-harbor-highlight">
                  {cap.badge}
                </span>
                <h3 className="text-[18px] font-bold text-harbor-white">
                  {cap.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-harbor-secondary">
                  {cap.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[21px] font-bold text-harbor-white">
            {dict.publicSite.architectureTitle}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PUBLIC_TEXT_CONSTANTS.ARCHITECTURE_LAYERS.map((layer) => (
              <GlassCard key={layer.step} className="space-y-2 p-5">
                <span className="text-[12px] font-extrabold text-harbor-blue">
                  STEP {layer.step}
                </span>
                <h3 className="text-[17px] font-bold text-harbor-white">
                  {layer.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-harbor-secondary">
                  {layer.detail}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
