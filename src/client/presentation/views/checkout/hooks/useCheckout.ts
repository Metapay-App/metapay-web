"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import {
  TOKENS_BY_SYMBOL,
  findTokenByAddress,
  type TokenSymbol,
} from "@/core/constants/contracts";
import {
  IDENTITY_DI_TOKENS,
  INVOICE_DI_TOKENS,
  PAYMENT_DI_TOKENS,
  getService,
} from "@/core/di/container";
import {
  executePayDirectOnChain,
  quotePaymentOnChain,
} from "@/core/blockchain/wallet-client";
import { formatTokenAmount } from "@/core/utils/format";
import type { MeIdentityProfile } from "@/client/domain/identity/entity/identity_entity";
import type { InvoiceItem } from "@/client/domain/invoice/entity/invoice_entity";
import type { TransactionItem } from "@/client/domain/payment/entity/payment_entity";
import { useWallet } from "@/client/presentation/components";

export function useCheckout(refId: string) {
  const { address, isWrongNetwork, connect, switchNetwork, refreshWalletState, balances } =
    useWallet();

  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [recipientIdentity, setRecipientIdentity] =
    useState<MeIdentityProfile | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [paySymbol, setPaySymbol] = useState<TokenSymbol>("mUSDT");
  const [quotedRaw, setQuotedRaw] = useState<bigint | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [verifiedTx, setVerifiedTx] = useState<TransactionItem | null>(null);

  const loadInvoice = useCallback(async () => {
    setLoadingInvoice(true);
    setInvoiceError(null);
    try {
      const getInvoiceByRefId = getService(
        INVOICE_DI_TOKENS.GetInvoiceByRefIdUseCase
      );
      const getMeIdentity = getService(IDENTITY_DI_TOKENS.GetMeIdentityUseCase);
      const loaded = await getInvoiceByRefId.execute(refId);
      setInvoice(loaded);

      const targetToken = findTokenByAddress(loaded.targetToken);
      if (targetToken) {
        setPaySymbol(targetToken.symbol);
      }

      try {
        const identity = await getMeIdentity.execute(loaded.recipientAddress);
        setRecipientIdentity(identity);
      } catch {
        // Non-fatal identity lookup
      }
    } catch (error) {
      setInvoiceError(
        error instanceof Error ? error.message : "Failed to load invoice."
      );
    } finally {
      setLoadingInvoice(false);
    }
  }, [refId]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const selectedPayToken = TOKENS_BY_SYMBOL[paySymbol];

  const refreshQuote = useCallback(async () => {
    if (!invoice) return;
    setQuoteLoading(true);
    try {
      const required = await quotePaymentOnChain(
        selectedPayToken.address,
        invoice.targetToken,
        invoice.targetAmount
      );
      setQuotedRaw(required);
    } catch {
      setQuotedRaw(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [invoice, selectedPayToken.address]);

  useEffect(() => {
    void refreshQuote();
  }, [refreshQuote]);

  const maxPayWithSlippage = useMemo(() => {
    if (quotedRaw === null || !invoice) return null;
    if (
      selectedPayToken.address.toLowerCase() ===
      invoice.targetToken.toLowerCase()
    ) {
      return quotedRaw;
    }
    return (quotedRaw * 101n) / 100n;
  }, [quotedRaw, invoice, selectedPayToken.address]);

  const quotedDisplay = useMemo(() => {
    if (maxPayWithSlippage === null) return "—";
    return `${formatTokenAmount(
      maxPayWithSlippage,
      selectedPayToken.decimals,
      selectedPayToken.decimals === 2 ? 2 : 4
    )} ${selectedPayToken.symbol}`;
  }, [maxPayWithSlippage, selectedPayToken]);

  const handlePayNow = useCallback(async () => {
    if (!invoice) return;
    setTxError(null);

    if (!address) {
      await connect();
      return;
    }
    if (isWrongNetwork) {
      await switchNetwork();
      return;
    }

    setSubmitting(true);
    try {
      const freshQuote = await quotePaymentOnChain(
        selectedPayToken.address,
        invoice.targetToken,
        invoice.targetAmount
      );
      const isSameToken =
        selectedPayToken.address.toLowerCase() ===
        invoice.targetToken.toLowerCase();
      const maxAmount = isSameToken ? freshQuote : (freshQuote * 101n) / 100n;

      const expiresAtUnix =
        invoice.expiryType === "FIXED" && invoice.expiresAt
          ? Math.floor(new Date(invoice.expiresAt).getTime() / 1000)
          : 0;

      const normalizedRefId = invoice.refId.startsWith("0x")
        ? invoice.refId
        : ethers.id(invoice.refId);

      const txHash = await executePayDirectOnChain({
        refId: normalizedRefId,
        recipient: invoice.recipientAddress,
        targetToken: invoice.targetToken,
        targetAmount: invoice.targetAmount,
        expiresAtUnix,
        splits: invoice.splits.map((s) => ({
          recipient: s.recipient,
          bps: s.bps,
        })),
        payToken: selectedPayToken.address,
        maxPayAmount: maxAmount,
      });

      const verifyPayment = getService(PAYMENT_DI_TOKENS.VerifyPaymentUseCase);
      const synced = await verifyPayment.execute(invoice.refId, txHash);
      setVerifiedTx(synced);
      await Promise.all([loadInvoice(), refreshWalletState()]);
    } catch (error) {
      setTxError(
        error instanceof Error ? error.message : "On-chain payment failed."
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    invoice,
    address,
    isWrongNetwork,
    connect,
    switchNetwork,
    selectedPayToken,
    loadInvoice,
    refreshWalletState,
  ]);

  return {
    address,
    isWrongNetwork,
    balances,
    invoice,
    recipientIdentity,
    loadingInvoice,
    invoiceError,
    paySymbol,
    setPaySymbol,
    selectedPayToken,
    quotedDisplay,
    quoteLoading,
    submitting,
    txError,
    verifiedTx,
    loadInvoice,
    handlePayNow,
  };
}
