"use client";

import React from "react";
import { TOKEN_LIST } from "@/core/constants/contracts";
import { getDictionary, type Locale } from "@/core/translator";
import {
  formatBpsToPercent,
  formatTokenAmount,
  shortenAddress,
} from "@/core/utils/format";
import {
  AdminShell,
  GlassCard,
  HarborButton,
  HarborInput,
  HarborSelect,
  ToastBanner,
  TokenPill,
} from "@/client/presentation/components";
import { ADMIN_SEMANTIC_IDS } from "./constants/SemanticIdConstant";
import { ADMIN_TEXT_CONSTANTS } from "./constants/TextConstant";
import { useAdmin } from "./hooks/useAdmin";

export function AdminRouterView({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const {
    address,
    routerSnapshot,
    loadingRouter,
    isRouterOwner,
    feeBpsInput,
    setFeeBpsInput,
    selectedTokenAddress,
    setSelectedTokenAddress,
    priceUsdInput,
    setPriceUsdInput,
    submittingRouterTx,
    feedback,
    setFeedback,
    fetchRouter,
    handleUpdateFeeBps,
    handleUpdateTokenPrice,
  } = useAdmin();

  const erc20Tokens = TOKEN_LIST.filter((t) => !t.isNative);

  return (
    <AdminShell
      lang={lang}
      title={dict.admin.routerTitle}
      subtitle="Manage MetaPaySwapRouter swap fee (bps), reference USD token prices, and liquidity inventory."
    >
      {feedback ? (
        <ToastBanner
          tone={feedback.tone}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <ToastBanner
        tone={isRouterOwner ? "success" : "info"}
        message={
          routerSnapshot
            ? `Router Owner: ${routerSnapshot.ownerAddress} · Connected: ${
                address ? shortenAddress(address) : "None"
              } (${isRouterOwner ? "Owner Match" : ADMIN_TEXT_CONSTANTS.OWNER_NOTE})`
            : ADMIN_TEXT_CONSTANTS.OWNER_NOTE
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <form
            id={ADMIN_SEMANTIC_IDS.ROUTER_FEE_FORM}
            onSubmit={handleUpdateFeeBps}
            className="space-y-4"
          >
            <h2 className="text-[18px] font-bold text-harbor-white">
              {dict.admin.updateFeeBps}
            </h2>
            <p className="text-[13px] text-harbor-secondary">
              Current swap fee:{" "}
              <strong className="text-harbor-white">
                {routerSnapshot
                  ? `${routerSnapshot.swapFeeBps} bps (${formatBpsToPercent(
                      routerSnapshot.swapFeeBps
                    )})`
                  : "—"}
              </strong>
            </p>
            <HarborInput
              label={`Swap Fee BPS (0 - ${ADMIN_TEXT_CONSTANTS.MAX_FEE_BPS})`}
              type="number"
              min={0}
              max={ADMIN_TEXT_CONSTANTS.MAX_FEE_BPS}
              value={feeBpsInput}
              onChange={(e) => setFeeBpsInput(e.target.value)}
              required
            />
            <HarborButton
              type="submit"
              loading={submittingRouterTx}
              className="w-full"
            >
              {dict.admin.updateFeeBps}
            </HarborButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <form
            id={ADMIN_SEMANTIC_IDS.ROUTER_PRICE_FORM}
            onSubmit={handleUpdateTokenPrice}
            className="space-y-4"
          >
            <h2 className="text-[18px] font-bold text-harbor-white">
              {dict.admin.updateTokenPrice}
            </h2>
            <HarborSelect
              label="Target ERC-20 Token"
              value={selectedTokenAddress}
              onChange={(e) => setSelectedTokenAddress(e.target.value)}
            >
              {erc20Tokens.map((t) => (
                <option
                  key={t.symbol}
                  value={t.address}
                  className="bg-harbor-black"
                >
                  {t.symbol} — {t.name} ({t.decimals} decimals)
                </option>
              ))}
            </HarborSelect>

            <HarborInput
              label="USD Price per 1 Whole Token (1e18 Scaled)"
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1.0 or 0.0000625"
              value={priceUsdInput}
              onChange={(e) => setPriceUsdInput(e.target.value)}
              required
            />

            <HarborButton
              type="submit"
              loading={submittingRouterTx}
              className="w-full"
            >
              {dict.admin.updateTokenPrice}
            </HarborButton>
          </form>
        </GlassCard>
      </div>

      <GlassCard variant="glow" className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold text-harbor-white">
            On-Chain Router Token State & Reserves
          </h2>
          <HarborButton
            size="sm"
            variant="glass"
            loading={loadingRouter}
            onClick={() => void fetchRouter()}
          >
            {dict.common.refresh}
          </HarborButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-harbor-white/10 text-[12px] text-harbor-caption">
                <th className="py-3 pr-3">Token</th>
                <th className="py-3 pr-3">Contract</th>
                <th className="py-3 pr-3">USD Reference Price</th>
                <th className="py-3">Router Liquidity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-harbor-white/10">
              {(routerSnapshot?.tokens ?? []).map((item) => (
                <tr key={item.token.symbol}>
                  <td className="py-3 pr-3">
                    <TokenPill tokenAddressOrSymbol={item.token.symbol} />
                  </td>
                  <td className="py-3 pr-3 font-mono text-harbor-secondary">
                    {shortenAddress(item.token.address)}
                  </td>
                  <td className="py-3 pr-3 text-harbor-white">
                    ${formatTokenAmount(item.priceUsdE18, 18, 6)}
                  </td>
                  <td className="py-3 font-bold text-harbor-white">
                    {formatTokenAmount(
                      item.routerLiquidity,
                      item.token.decimals,
                      item.token.decimals === 2 ? 2 : 4
                    )}{" "}
                    {item.token.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AdminShell>
  );
}
