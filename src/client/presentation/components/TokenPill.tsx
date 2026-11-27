import React from "react";
import { findTokenByAddress, findTokenBySymbol } from "@/core/constants/contracts";

export function TokenPill({
  tokenAddressOrSymbol,
  className = "",
}: {
  tokenAddressOrSymbol: string;
  className?: string;
}) {
  const token =
    findTokenBySymbol(tokenAddressOrSymbol) ??
    findTokenByAddress(tokenAddressOrSymbol);

  const symbol = token?.symbol ?? "TOKEN";
  const decimals = token?.decimals ?? 18;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge border border-harbor-white/20 bg-harbor-surface/45 px-2.5 py-1 text-[12px] font-bold text-harbor-white ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-harbor-blue text-[10px] font-extrabold text-harbor-white"
      >
        {symbol.slice(0, 1)}
      </span>
      <span>{symbol}</span>
      <span className="text-[11px] font-normal text-harbor-caption">
        {decimals}d
      </span>
    </span>
  );
}
