import { ethers } from "ethers";
import abis from "./abis.json";

export type TokenSymbol = "MEC" | "WMEC" | "mUSDT" | "mUSDC" | "IDRC";

export interface TokenConfig {
  symbol: TokenSymbol;
  name: string;
  address: string;
  decimals: number;
  isNative: boolean;
}

export const CHAIN_CONFIG = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || "400"),
  name: "Meta Earth Testnet",
  nativeCurrency: {
    name: "MEC",
    symbol: "MEC",
    decimals: 18,
  },
  rpcProxyPath: "/api/v1/rpc",
} as const;

export const CONTRACT_ADDRESSES = {
  gateway:
    process.env.NEXT_PUBLIC_GATEWAY_ADDRESS ||
    "0xd407227189D8D78E5FcAa61A9B64052A5555DAf6",
  router:
    process.env.NEXT_PUBLIC_ROUTER_ADDRESS ||
    "0x66b0F06a3960f31B0C6a7132917fF12cD6e37Eb2",
  wmec:
    process.env.NEXT_PUBLIC_WMEC_ADDRESS ||
    "0x73bc53fB104CA39E5FBfaf870ed185C94D81893E",
  mUSDT:
    process.env.NEXT_PUBLIC_MUSDT_ADDRESS ||
    "0x427C9625E57d6c47d2850a2C5366AB094515C2C3",
  mUSDC:
    process.env.NEXT_PUBLIC_MUSDC_ADDRESS ||
    "0x61F2D51798C9644c9A42BD13fa3f13846B53aac8",
  IDRC:
    process.env.NEXT_PUBLIC_IDRC_ADDRESS ||
    "0xb4d995c522e368360613E913160A1ACF5b1bdb1c",
} as const;

export const TOKEN_LIST: readonly TokenConfig[] = [
  {
    symbol: "MEC",
    name: "Meta Earth Coin",
    address: ethers.ZeroAddress,
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "WMEC",
    name: "Wrapped MEC",
    address: CONTRACT_ADDRESSES.wmec,
    decimals: 18,
    isNative: false,
  },
  {
    symbol: "mUSDT",
    name: "Meta USDT",
    address: CONTRACT_ADDRESSES.mUSDT,
    decimals: 6,
    isNative: false,
  },
  {
    symbol: "mUSDC",
    name: "Meta USDC",
    address: CONTRACT_ADDRESSES.mUSDC,
    decimals: 6,
    isNative: false,
  },
  {
    symbol: "IDRC",
    name: "Indonesian Rupiah Coin",
    address: CONTRACT_ADDRESSES.IDRC,
    decimals: 2,
    isNative: false,
  },
] as const;

export const TOKENS_BY_SYMBOL: Record<TokenSymbol, TokenConfig> = {
  MEC: TOKEN_LIST[0],
  WMEC: TOKEN_LIST[1],
  mUSDT: TOKEN_LIST[2],
  mUSDC: TOKEN_LIST[3],
  IDRC: TOKEN_LIST[4],
};

export function findTokenByAddress(address: string): TokenConfig | undefined {
  const normalized = address.toLowerCase();
  return TOKEN_LIST.find((t) => t.address.toLowerCase() === normalized);
}

export function findTokenBySymbol(symbol: string): TokenConfig | undefined {
  const normalized = symbol.toLowerCase();
  return TOKEN_LIST.find((t) => t.symbol.toLowerCase() === normalized);
}

export const CONTRACT_ABIS = abis;
