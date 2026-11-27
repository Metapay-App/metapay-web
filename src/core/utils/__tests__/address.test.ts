import { describe, expect, it } from "vitest";
import {
  convert0xToMeAddress,
  convertMeTo0xAddress,
  isValid0xAddress,
  isValidMeAddress,
  normalizeToEvmAndMe,
} from "../address";

describe("address utilities", () => {
  const sample0x = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  it("converts 0x <-> me1 round-trip cleanly", () => {
    const meAddr = convert0xToMeAddress(sample0x);
    expect(meAddr.startsWith("me1")).toBe(true);
    expect(isValidMeAddress(meAddr)).toBe(true);
    expect(isValid0xAddress(sample0x)).toBe(true);

    const backTo0x = convertMeTo0xAddress(meAddr);
    expect(backTo0x).toBe(sample0x);
  });

  it("normalizes both lowercase 0x and me1 addresses", () => {
    const meAddr = convert0xToMeAddress(sample0x);

    const from0x = normalizeToEvmAndMe(sample0x.toLowerCase());
    const fromMe = normalizeToEvmAndMe(meAddr);

    expect(from0x).toEqual({ evmAddress: sample0x, meAddress: meAddr });
    expect(fromMe).toEqual({ evmAddress: sample0x, meAddress: meAddr });
  });

  it("throws on invalid address inputs", () => {
    expect(isValid0xAddress("not-an-address")).toBe(false);
    expect(isValidMeAddress("cosmos1abc")).toBe(false);
    expect(() => normalizeToEvmAndMe("invalid-address")).toThrow();
  });
});
