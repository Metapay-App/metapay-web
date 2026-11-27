import { bech32 } from "bech32";
import { getAddress, isAddress } from "ethers";

export const ME_BECH32_PREFIX = "me";

export interface NormalizedAddressPair {
  evmAddress: string;
  meAddress: string;
}

export function isValid0xAddress(value: string): boolean {
  return isAddress(value);
}

export function isValidMeAddress(value: string): boolean {
  try {
    const decoded = bech32.decode(value.trim());
    if (decoded.prefix !== ME_BECH32_PREFIX) return false;
    const bytes = bech32.fromWords(decoded.words);
    return bytes.length === 20;
  } catch {
    return false;
  }
}

export function convert0xToMeAddress(ethAddress: string): string {
  const checksummed = getAddress(ethAddress.trim());
  const hex = checksummed.slice(2);
  const bytes = Uint8Array.from(
    hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );
  if (bytes.length !== 20) {
    throw new Error(`Invalid 20-byte EVM address: ${ethAddress}`);
  }
  const words = bech32.toWords(bytes);
  return bech32.encode(ME_BECH32_PREFIX, words);
}

export function convertMeTo0xAddress(meAddress: string): string {
  const decoded = bech32.decode(meAddress.trim());
  if (decoded.prefix !== ME_BECH32_PREFIX) {
    throw new Error(`Invalid Meta Earth address prefix: ${decoded.prefix}`);
  }
  const bytes = bech32.fromWords(decoded.words);
  if (bytes.length !== 20) {
    throw new Error(`Invalid Meta Earth address payload length: ${bytes.length}`);
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return getAddress(`0x${hex}`);
}

export function normalizeToEvmAndMe(input: string): NormalizedAddressPair {
  const trimmed = input.trim();
  if (isValid0xAddress(trimmed)) {
    const evmAddress = getAddress(trimmed);
    return {
      evmAddress,
      meAddress: convert0xToMeAddress(evmAddress),
    };
  }
  if (isValidMeAddress(trimmed)) {
    const evmAddress = convertMeTo0xAddress(trimmed);
    return {
      evmAddress,
      meAddress: convert0xToMeAddress(evmAddress),
    };
  }
  throw new Error(`Invalid EVM (0x) or Meta Earth (me1) address: ${input}`);
}
