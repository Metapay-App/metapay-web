"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  TOKENS_BY_SYMBOL,
  type TokenSymbol,
} from "@/core/constants/contracts";
import {
  HTTP402_DI_TOKENS,
  INVOICE_DI_TOKENS,
  MERCHANT_DI_TOKENS,
  PAYMENT_DI_TOKENS,
  getService,
} from "@/core/di/container";
import {
  claimFaucetOnChain,
  executePayDirectOnChain,
  quotePaymentOnChain,
  unwrapWmecOnChain,
  wrapMecOnChain,
} from "@/core/blockchain/wallet-client";
import { parseHumanTokenAmount } from "@/core/utils/format";
import type { Http402DemoResponse } from "@/client/domain/http402/entity/http402_entity";
import type {
  InvoiceItem,
  InvoiceStatus,
} from "@/client/domain/invoice/entity/invoice_entity";
import type { TransactionItem } from "@/client/domain/payment/entity/payment_entity";
import { useWallet } from "@/client/presentation/components";

export interface SplitDraftRow {
  recipient: string;
  bps: string;
}

export function usePortal() {
  const {
    address,
    isWrongNetwork,
    balances,
    merchantProfile,
    savedApiKey,
    connect,
    switchNetwork,
    refreshWalletState,
    saveMerchantApiKey,
    setMerchantProfile,
  } = useWallet();

  // Invoices & Create Form state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<InvoiceItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [recipientInput, setRecipientInput] = useState("");
  const [targetSymbol, setTargetSymbol] = useState<TokenSymbol>("mUSDT");
  const [amountInput, setAmountInput] = useState("25");
  const [expiryType, setExpiryType] = useState<"FIXED" | "NO_LIMIT">("FIXED");
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [enableSplits, setEnableSplits] = useState(false);
  const [splitRows, setSplitRows] = useState<SplitDraftRow[]>([
    { recipient: "", bps: "8000" },
    { recipient: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", bps: "2000" },
  ]);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<InvoiceItem | null>(null);

  // History state
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRole, setHistoryRole] = useState<"all" | "payer" | "recipient">(
    "all"
  );

  // HTTP 402 Playground state
  const [http402Response, setHttp402Response] =
    useState<Http402DemoResponse | null>(null);
  const [http402PaySymbol, setHttp402PaySymbol] = useState<TokenSymbol>("IDRC");
  const [http402Loading, setHttp402Loading] = useState(false);

  // Settings / Merchant / Faucet state
  const [merchantNameInput, setMerchantNameInput] = useState("");
  const [freshApiKey, setFreshApiKey] = useState<string | null>(null);
  const [savingMerchant, setSavingMerchant] = useState(false);
  const [wrapAmountInput, setWrapAmountInput] = useState("5");
  const [faucetBusySymbol, setFaucetBusySymbol] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (address && !recipientInput) {
      setRecipientInput(address);
      setSplitRows((prev) =>
        prev.map((row, idx) =>
          idx === 0 && !row.recipient ? { ...row, recipient: address } : row
        )
      );
    }
  }, [address, recipientInput]);

  useEffect(() => {
    if (merchantProfile && !merchantNameInput) {
      setMerchantNameInput(merchantProfile.name);
    }
  }, [merchantProfile, merchantNameInput]);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const listInvoices = getService(INVOICE_DI_TOKENS.ListInvoicesUseCase);
      const list = await listInvoices.execute({
        recipient: address ?? undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        limit: 50,
      });
      setInvoices(list);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Failed to load invoices.",
      });
    } finally {
      setInvoicesLoading(false);
    }
  }, [address, statusFilter]);

  const fetchHistory = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      return;
    }
    setHistoryLoading(true);
    try {
      const getTxHistory = getService(PAYMENT_DI_TOKENS.GetTxHistoryUseCase);
      const rows = await getTxHistory.execute({
        address,
        role: historyRole,
        limit: 50,
      });
      setTransactions(rows);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load transaction history.",
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [address, historyRole]);

  const handleCreateInvoice = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFeedback(null);
      setCreatingInvoice(true);
      try {
        const token = TOKENS_BY_SYMBOL[targetSymbol];
        const rawAmount = parseHumanTokenAmount(amountInput, token.decimals);
        if (rawAmount <= 0n) {
          throw new Error("Target amount must be greater than zero.");
        }

        const parsedSplits = enableSplits
          ? splitRows
              .filter((r) => r.recipient.trim())
              .map((r) => ({
                recipient: r.recipient.trim(),
                bps: Number.parseInt(r.bps, 10),
              }))
          : undefined;

        const createInvoice = getService(INVOICE_DI_TOKENS.CreateInvoiceUseCase);
        const inv = await createInvoice.execute(
          {
            recipient: recipientInput.trim(),
            targetToken: token.symbol,
            targetAmount: rawAmount.toString(),
            expiryType,
            ...(expiryType === "FIXED" ? { expirySeconds } : {}),
            splits: parsedSplits,
            description: descriptionInput.trim() || undefined,
          },
          savedApiKey || undefined
        );

        setCreatedInvoice(inv);
        setDescriptionInput("");
        setFeedback({
          tone: "success",
          message: `Invoice created (${inv.refId.slice(0, 12)}...).`,
        });
        await fetchInvoices();
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Failed to create invoice.",
        });
      } finally {
        setCreatingInvoice(false);
      }
    },
    [
      targetSymbol,
      amountInput,
      enableSplits,
      splitRows,
      recipientInput,
      expiryType,
      expirySeconds,
      descriptionInput,
      savedApiKey,
      fetchInvoices,
    ]
  );

  const handleConfirmCancelInvoice = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setFeedback(null);
    try {
      const cancelInvoice = getService(INVOICE_DI_TOKENS.CancelInvoiceUseCase);
      const updated = await cancelInvoice.execute(
        cancelTarget.refId,
        address ?? undefined,
        savedApiKey || undefined
      );
      setCancelTarget(null);
      if (selectedInvoice?.refId === updated.refId) {
        setSelectedInvoice(updated);
      }
      setFeedback({
        tone: "success",
        message: "Invoice cancelled successfully.",
      });
      await fetchInvoices();
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Failed to cancel invoice.",
      });
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, address, savedApiKey, selectedInvoice, fetchInvoices]);

  const handleRequestHttp402Challenge = useCallback(async () => {
    setHttp402Loading(true);
    setFeedback(null);
    try {
      const requestHttp402Demo = getService(
        HTTP402_DI_TOKENS.RequestHttp402DemoUseCase
      );
      const res = await requestHttp402Demo.execute();
      setHttp402Response(res);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "HTTP 402 request failed.",
      });
    } finally {
      setHttp402Loading(false);
    }
  }, []);

  const handleSettleHttp402AndUnlock = useCallback(async () => {
    const challenge = http402Response?.challenge;
    if (!challenge) return;

    if (!address) {
      await connect();
      return;
    }
    if (isWrongNetwork) {
      await switchNetwork();
      return;
    }

    setHttp402Loading(true);
    setFeedback(null);
    try {
      const payToken = TOKENS_BY_SYMBOL[http402PaySymbol];
      const quoted = await quotePaymentOnChain(
        payToken.address,
        challenge.targetToken,
        challenge.targetAmount
      );
      const isSame =
        payToken.address.toLowerCase() === challenge.targetToken.toLowerCase();
      const maxAmount = isSame ? quoted : (quoted * 101n) / 100n;
      const expiresAtUnix =
        challenge.expiryType === "FIXED" && challenge.expiresAt
          ? Math.floor(new Date(challenge.expiresAt).getTime() / 1000)
          : 0;
      const normalizedRefId = challenge.refId.startsWith("0x")
        ? challenge.refId
        : ethers.id(challenge.refId);

      const txHash = await executePayDirectOnChain({
        refId: normalizedRefId,
        recipient: challenge.recipient,
        targetToken: challenge.targetToken,
        targetAmount: challenge.targetAmount,
        expiresAtUnix,
        splits: challenge.splits,
        payToken: payToken.address,
        maxPayAmount: maxAmount,
      });

      const requestHttp402Demo = getService(
        HTTP402_DI_TOKENS.RequestHttp402DemoUseCase
      );
      const unlocked = await requestHttp402Demo.execute({
        refId: challenge.refId,
        txHash,
      });
      setHttp402Response(unlocked);
      setFeedback({
        tone: "success",
        message: "HTTP 402 payment verified on-chain and endpoint unlocked!",
      });
      await refreshWalletState();
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "HTTP 402 settlement failed.",
      });
    } finally {
      setHttp402Loading(false);
    }
  }, [
    http402Response,
    address,
    connect,
    isWrongNetwork,
    switchNetwork,
    http402PaySymbol,
    refreshWalletState,
  ]);

  const handleRegisterOrRotateMerchant = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!address) {
        await connect();
        return;
      }
      setSavingMerchant(true);
      setFeedback(null);
      try {
        const registerMerchant = getService(
          MERCHANT_DI_TOKENS.RegisterMerchantUseCase
        );
        const result = await registerMerchant.execute(
          address,
          merchantNameInput.trim() || "Meta Pay Merchant"
        );
        setMerchantProfile(result.merchant);
        saveMerchantApiKey(address, result.apiKey);
        setFreshApiKey(result.apiKey);
        setFeedback({
          tone: "success",
          message: "Merchant profile saved & fresh API Key generated!",
        });
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to save merchant profile.",
        });
      } finally {
        setSavingMerchant(false);
      }
    },
    [address, connect, merchantNameInput, saveMerchantApiKey, setMerchantProfile]
  );

  const handleClaimFaucet = useCallback(
    async (symbol: TokenSymbol) => {
      if (!address) {
        await connect();
        return;
      }
      if (isWrongNetwork) {
        await switchNetwork();
        return;
      }
      setFaucetBusySymbol(symbol);
      setFeedback(null);
      try {
        const token = TOKENS_BY_SYMBOL[symbol];
        if (symbol === "WMEC") {
          const amountWei = parseHumanTokenAmount(wrapAmountInput || "5", 18);
          await wrapMecOnChain(amountWei);
          setFeedback({
            tone: "success",
            message: `Wrapped ${wrapAmountInput} MEC into WMEC.`,
          });
        } else {
          await claimFaucetOnChain(token.address);
          setFeedback({
            tone: "success",
            message: `Claimed ${symbol} testnet faucet tokens!`,
          });
        }
        await refreshWalletState();
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error ? error.message : "Faucet action failed.",
        });
      } finally {
        setFaucetBusySymbol(null);
      }
    },
    [address, connect, isWrongNetwork, switchNetwork, wrapAmountInput, refreshWalletState]
  );

  const handleUnwrapWmec = useCallback(async () => {
    if (!address) {
      await connect();
      return;
    }
    if (isWrongNetwork) {
      await switchNetwork();
      return;
    }
    setFaucetBusySymbol("UNWRAP_WMEC");
    setFeedback(null);
    try {
      const amountWei = parseHumanTokenAmount(wrapAmountInput || "5", 18);
      await unwrapWmecOnChain(amountWei);
      setFeedback({
        tone: "success",
        message: `Unwrapped ${wrapAmountInput} WMEC back to native MEC.`,
      });
      await refreshWalletState();
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Failed to unwrap WMEC.",
      });
    } finally {
      setFaucetBusySymbol(null);
    }
  }, [address, connect, isWrongNetwork, switchNetwork, wrapAmountInput, refreshWalletState]);

  return {
    address,
    balances,
    merchantProfile,
    savedApiKey,
    feedback,
    setFeedback,
    // Invoices
    invoices,
    invoicesLoading,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    setSelectedInvoice,
    cancelTarget,
    setCancelTarget,
    cancelling,
    fetchInvoices,
    // Create form
    recipientInput,
    setRecipientInput,
    targetSymbol,
    setTargetSymbol,
    amountInput,
    setAmountInput,
    expiryType,
    setExpiryType,
    expirySeconds,
    setExpirySeconds,
    descriptionInput,
    setDescriptionInput,
    enableSplits,
    setEnableSplits,
    splitRows,
    setSplitRows,
    creatingInvoice,
    createdInvoice,
    handleCreateInvoice,
    handleConfirmCancelInvoice,
    // History
    transactions,
    historyLoading,
    historyRole,
    setHistoryRole,
    fetchHistory,
    // HTTP 402
    http402Response,
    http402PaySymbol,
    setHttp402PaySymbol,
    http402Loading,
    handleRequestHttp402Challenge,
    handleSettleHttp402AndUnlock,
    // Merchant & Faucet
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
  };
}
