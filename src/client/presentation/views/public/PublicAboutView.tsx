"use client";

import React from "react";
import { CONTRACT_ADDRESSES } from "@/core/constants/contracts";
import { getDictionary, type Locale } from "@/core/translator";
import {
  CopyButton,
  GlassCard,
  HarborInput,
  PublicNavbar,
} from "@/client/presentation/components";
import { PUBLIC_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { PUBLIC_TEXT_CONSTANTS } from "./constants/TextConstant";
import { usePublic } from "./hooks/usePublic";

export function PublicAboutView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    converterInput,
    converterResult,
    converterError,
    handleConvertAddress,
  } = usePublic();

  const contractEntries = [
    { label: "MetaPayGateway", address: CONTRACT_ADDRESSES.gateway },
    { label: "MetaPaySwapRouter", address: CONTRACT_ADDRESSES.router },
    { label: "WMEC (Wrapped MEC)", address: CONTRACT_ADDRESSES.wmec },
    { label: "mUSDT (Meta USDT)", address: CONTRACT_ADDRESSES.mUSDT },
    { label: "mUSDC (Meta USDC)", address: CONTRACT_ADDRESSES.mUSDC },
    { label: "IDRC (Indonesian Rupiah Coin)", address: CONTRACT_ADDRESSES.IDRC },
  ];

  return (
    <div className="harbor-canvas min-h-screen">
      <PublicNavbar lang={lang} />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <GlassCard variant="glow" className="p-8">
          <h1 className="text-[31px] font-extrabold text-harbor-white">
            {dict.publicSite.aboutTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-harbor-secondary">
            {dict.publicSite.aboutSubtitle}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PUBLIC_TEXT_CONSTANTS.CONTRACT_LINKS.map((item) => (
              <div
                key={item.label}
                className="rounded-control border border-harbor-white/15 bg-harbor-black/55 p-4"
              >
                <span className="block text-[12px] text-harbor-caption">
                  {item.label}
                </span>
                <span className="mt-1 block text-[15px] font-bold text-harbor-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <section
          id={PUBLIC_SEMANTIC_IDS.ADDRESS_CONVERTER}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <GlassCard className="space-y-4 p-6">
            <h2 className="text-[21px] font-bold text-harbor-white">
              0x ↔ me1 Address Translator
            </h2>
            <p className="text-[14px] text-harbor-secondary">
              Paste any Ethereum hexadecimal address (0x...) or Meta Earth Bech32
              address (me1...) to derive its canonical twin.
            </p>
            <HarborInput
              label="EVM (0x) or Meta Earth (me1) Address"
              value={converterInput}
              onChange={(e) => handleConvertAddress(e.target.value)}
              error={converterError ?? undefined}
            />
            {converterResult ? (
              <div className="space-y-3 rounded-control border border-harbor-glow/40 bg-harbor-black/65 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold text-harbor-caption">
                      EVM (0x)
                    </span>
                    <p className="truncate font-mono text-[13px] text-harbor-white">
                      {converterResult.evmAddress}
                    </p>
                  </div>
                  <CopyButton lang={lang} value={converterResult.evmAddress} />
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-harbor-white/10 pt-3">
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold text-harbor-caption">
                      Meta Earth (me1)
                    </span>
                    <p className="truncate font-mono text-[13px] text-harbor-white">
                      {converterResult.meAddress}
                    </p>
                  </div>
                  <CopyButton lang={lang} value={converterResult.meAddress} />
                </div>
              </div>
            ) : null}
          </GlassCard>

          <GlassCard
            className="space-y-4 p-6"
          >
            <div id={PUBLIC_SEMANTIC_IDS.ABOUT_ARCHITECTURE}>
              <h2 className="text-[21px] font-bold text-harbor-white">
                Deployed Contracts Registry
              </h2>
              <p className="mt-1 text-[14px] text-harbor-secondary">
                All protocol contracts configured for Meta Earth Testnet / local
                Hardhat mirror.
              </p>
            </div>
            <div className="space-y-2.5">
              {contractEntries.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between gap-3 rounded-control border border-harbor-white/10 bg-harbor-black/55 px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <span className="block text-[13px] font-bold text-harbor-white">
                      {entry.label}
                    </span>
                    <span className="block truncate font-mono text-[12px] text-harbor-caption">
                      {entry.address}
                    </span>
                  </div>
                  <CopyButton lang={lang} value={entry.address} />
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
}
