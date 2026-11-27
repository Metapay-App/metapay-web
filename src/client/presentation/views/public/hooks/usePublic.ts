"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TOKENS_BY_SYMBOL,
  type TokenSymbol,
} from "@/core/constants/contracts";
import { quotePaymentOnChain } from "@/core/blockchain/wallet-client";
import { normalizeToEvmAndMe } from "@/core/utils/address";
import { formatTokenAmount, parseHumanTokenAmount } from "@/core/utils/format";

export function usePublic() {
  const [paySymbol, setPaySymbol] = useState<TokenSymbol>("IDRC");
  const [targetSymbol, setTargetSymbol] = useState<TokenSymbol>("mUSDT");
  const [targetAmountInput, setTargetAmountInput] = useState("10");
  const [quotedPayDisplay, setQuotedPayDisplay] = useState<string>("~160,481 IDRC");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [converterInput, setConverterInput] = useState(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  );
  const [converterResult, setConverterResult] = useState<{
    evmAddress: string;
    meAddress: string;
  } | null>(() => {
    try {
      return normalizeToEvmAndMe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    } catch {
      return null;
    }
  });
  const [converterError, setConverterError] = useState<string | null>(null);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const runLiveQuote = useCallback(async () => {
    setQuoteError(null);
    setQuoteLoading(true);
    try {
      const payToken = TOKENS_BY_SYMBOL[paySymbol];
      const targetToken = TOKENS_BY_SYMBOL[targetSymbol];
      const targetRaw = parseHumanTokenAmount(
        targetAmountInput || "0",
        targetToken.decimals
      );
      if (targetRaw <= 0n) {
        setQuotedPayDisplay(`0 ${payToken.symbol}`);
        return;
      }
      const requiredRaw = await quotePaymentOnChain(
        payToken.address,
        targetToken.address,
        targetRaw.toString()
      );
      setQuotedPayDisplay(
        `${formatTokenAmount(
          requiredRaw,
          payToken.decimals,
          payToken.decimals === 2 ? 2 : 4
        )} ${payToken.symbol}`
      );
    } catch (error) {
      setQuoteError(
        error instanceof Error
          ? error.message
          : "On-chain quote preview unavailable (check local Hardhat/RPC node)."
      );
    } finally {
      setQuoteLoading(false);
    }
  }, [paySymbol, targetSymbol, targetAmountInput]);

  useEffect(() => {
    void runLiveQuote();
  }, [runLiveQuote]);

  const handleConvertAddress = useCallback((value: string) => {
    setConverterInput(value);
    setConverterError(null);
    if (!value.trim()) {
      setConverterResult(null);
      return;
    }
    try {
      setConverterResult(normalizeToEvmAndMe(value));
    } catch (error) {
      setConverterResult(null);
      setConverterError(
        error instanceof Error ? error.message : "Invalid address format"
      );
    }
  }, []);

  const handleSubmitContact = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
        return;
      }
      setContactSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    },
    [contactName, contactEmail, contactMessage]
  );

  return {
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
    converterInput,
    converterResult,
    converterError,
    handleConvertAddress,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactMessage,
    setContactMessage,
    contactSubmitted,
    handleSubmitContact,
  };
}
