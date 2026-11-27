import { formatUnits, parseUnits } from "ethers";
import { findTokenByAddress } from "../constants/contracts";

export function shortenAddress(address: string, head = 6, tail = 4): string {
  if (!address) return "";
  if (address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}...${address.slice(-tail)}`;
}

export function formatTokenAmount(
  rawAmount: string | bigint,
  decimals: number,
  maxFractionDigits = 4
): string {
  try {
    const formatted = formatUnits(BigInt(rawAmount), decimals);
    const [whole, frac] = formatted.split(".");
    if (!frac) return whole;
    const trimmed = frac.slice(0, maxFractionDigits).replace(/0+$/, "");
    return trimmed ? `${whole}.${trimmed}` : whole;
  } catch {
    return String(rawAmount);
  }
}

export function formatTokenDisplay(
  rawAmount: string | bigint,
  tokenAddress: string
): string {
  const token = findTokenByAddress(tokenAddress);
  if (!token) {
    return `${String(rawAmount)} (${shortenAddress(tokenAddress)})`;
  }
  const maxDigits = token.decimals === 2 ? 2 : 4;
  return `${formatTokenAmount(rawAmount, token.decimals, maxDigits)} ${token.symbol}`;
}

export function parseHumanTokenAmount(
  humanAmount: string,
  decimals: number
): bigint {
  const sanitized = humanAmount.trim();
  if (!sanitized) {
    throw new Error("Amount is required");
  }
  return parseUnits(sanitized, decimals);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2).replace(/\.00$/, "")}%`;
}
