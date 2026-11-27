"use client";

import React from "react";
import { TOKEN_LIST } from "@/core/constants/contracts";
import { getDictionary, type Locale } from "@/core/translator";
import { formatTokenAmount, shortenAddress } from "@/core/utils/format";
import {
  CopyButton,
  GlassCard,
  HarborButton,
  HarborInput,
  PortalShell,
  ToastBanner,
  TokenPill,
} from "@/client/presentation/components";
import { PORTAL_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { usePortal } from "./hooks/usePortal";

export function PortalSettingsView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    address,
    balances,
    merchantProfile,
    savedApiKey,
    merchantNameInput,
    setMerchantNameInput,
    freshApiKey,
    savingMerchant,
    wrapAmountInput,
    setWrapAmountInput,
    faucetBusySymbol,
    handleRegisterOrRotateMerchant,
    handleClaimFaucet,
    handleUnwrapWmec,
    feedback,
    setFeedback,
  } = usePortal();

  const erc20Tokens = TOKEN_LIST.filter((t) => !t.isNative);

  return (
    <PortalShell
      lang={lang}
      title={dict.nav.settings}
      subtitle="Register or rotate Merchant API keys, claim mUSDT/mUSDC/IDRC faucets, and wrap MEC."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <form
            id={PORTAL_SEMANTIC_IDS.MERCHANT_CONFIG}
            onSubmit={handleRegisterOrRotateMerchant}
            className="space-y-4"
          >
            <h2 className="text-[20px] font-bold text-harbor-white">
              {dict.portal.merchantProfileTitle}
            </h2>

            <HarborInput
              label="Merchant Display Name"
              placeholder="e.g. Harbor Digital Store"
              value={merchantNameInput}
              onChange={(e) => setMerchantNameInput(e.target.value)}
              required
            />

            {merchantProfile ? (
              <div className="space-y-2 rounded-control border border-harbor-white/10 bg-harbor-black/55 p-4 text-[13px]">
                <div className="flex justify-between gap-2">
                  <span className="text-harbor-caption">Wallet</span>
                  <span className="font-mono text-harbor-white">
                    {shortenAddress(merchantProfile.walletAddress)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-harbor-caption">Meta Earth (me1)</span>
                  <span className="font-mono text-harbor-secondary">
                    {shortenAddress(merchantProfile.meAddress, 8, 6)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-harbor-caption">Active Key Prefix</span>
                  <span className="font-mono font-bold text-harbor-white">
                    {merchantProfile.apiKeyPrefix}...
                  </span>
                </div>
              </div>
            ) : null}

            {freshApiKey || savedApiKey ? (
              <div className="space-y-2 rounded-control border border-harbor-glow/55 bg-harbor-blue/20 p-4 text-[12px]">
                <span className="font-bold text-harbor-white">
                  {freshApiKey
                    ? "New API Key (saved to local browser session)"
                    : "Cached Merchant API Key"}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-harbor-highlight">
                    {freshApiKey || savedApiKey}
                  </code>
                  <CopyButton lang={lang} value={freshApiKey || savedApiKey} />
                </div>
              </div>
            ) : null}

            <HarborButton
              type="submit"
              size="lg"
              className="w-full"
              loading={savingMerchant}
            >
              {merchantProfile
                ? dict.portal.rotateApiKey
                : dict.portal.registerMerchant}
            </HarborButton>
          </form>
        </GlassCard>

        <GlassCard variant="glow" className="space-y-5 p-6">
          <div id={PORTAL_SEMANTIC_IDS.FAUCET_GRID} className="space-y-4">
            <h2 className="text-[20px] font-bold text-harbor-white">
              {dict.portal.faucetTitle}
            </h2>

            <div className="space-y-3">
              {erc20Tokens.map((token) => {
                const rawBal = balances[token.symbol] ?? "0";
                const formatted = address
                  ? formatTokenAmount(
                      rawBal,
                      token.decimals,
                      token.decimals === 2 ? 2 : 4
                    )
                  : "—";
                const isWmec = token.symbol === "WMEC";

                return (
                  <div
                    key={token.symbol}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-harbor-white/10 bg-harbor-black/55 p-3.5"
                  >
                    <div>
                      <TokenPill tokenAddressOrSymbol={token.symbol} />
                      <p className="mt-1.5 text-[13px] font-bold text-harbor-white">
                        Balance: {formatted} {token.symbol}
                      </p>
                    </div>

                    {isWmec ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={wrapAmountInput}
                          onChange={(e) => setWrapAmountInput(e.target.value)}
                          className="glass-input w-20 px-2.5 py-1.5 text-[13px]"
                        />
                        <HarborButton
                          size="sm"
                          loading={faucetBusySymbol === "WMEC"}
                          onClick={() => void handleClaimFaucet("WMEC")}
                        >
                          Wrap
                        </HarborButton>
                        <HarborButton
                          size="sm"
                          variant="glass"
                          loading={faucetBusySymbol === "UNWRAP_WMEC"}
                          onClick={() => void handleUnwrapWmec()}
                        >
                          Unwrap
                        </HarborButton>
                      </div>
                    ) : (
                      <HarborButton
                        size="sm"
                        loading={faucetBusySymbol === token.symbol}
                        onClick={() => void handleClaimFaucet(token.symbol)}
                      >
                        {dict.portal.faucetClaim} {token.symbol}
                      </HarborButton>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </PortalShell>
  );
}
