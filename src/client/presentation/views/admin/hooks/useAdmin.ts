"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { TOKEN_LIST } from "@/core/constants/contracts";
import { ADMIN_DI_TOKENS, getService } from "@/core/di/container";
import {
  getRouterGovernanceSnapshot,
  setSwapFeeBpsOnChain,
  setTokenPriceOnChain,
  type RouterGovernanceSnapshot,
} from "@/core/blockchain/wallet-client";
import type { AdminOverviewData } from "@/client/domain/admin/entity/admin_entity";
import { useWallet } from "@/client/presentation/components";

export function useAdmin() {
  const { address, isWrongNetwork, connect, switchNetwork } = useWallet();

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const [routerSnapshot, setRouterSnapshot] =
    useState<RouterGovernanceSnapshot | null>(null);
  const [loadingRouter, setLoadingRouter] = useState(false);

  const [feeBpsInput, setFeeBpsInput] = useState("30");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState(
    TOKEN_LIST.find((t) => !t.isNative)?.address ?? ""
  );
  const [priceUsdInput, setPriceUsdInput] = useState("1.0");
  const [submittingRouterTx, setSubmittingRouterTx] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const getAdminOverview = getService(
        ADMIN_DI_TOKENS.GetAdminOverviewUseCase
      );
      const data = await getAdminOverview.execute(50);
      setOverview(data);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load protocol overview.",
      });
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchRouter = useCallback(async () => {
    setLoadingRouter(true);
    try {
      const snap = await getRouterGovernanceSnapshot();
      setRouterSnapshot(snap);
      setFeeBpsInput(String(snap.swapFeeBps));
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to inspect MetaPaySwapRouter.",
      });
    } finally {
      setLoadingRouter(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      void fetchOverview();
      void fetchRouter();
    });
    return () => {
      active = false;
    };
  }, [fetchOverview, fetchRouter]);

  const isRouterOwner =
    Boolean(address && routerSnapshot?.ownerAddress) &&
    address?.toLowerCase() === routerSnapshot?.ownerAddress.toLowerCase();

  const handleUpdateFeeBps = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!address) {
        await connect();
        return;
      }
      if (isWrongNetwork) {
        await switchNetwork();
        return;
      }
      setSubmittingRouterTx(true);
      setFeedback(null);
      try {
        const bps = Number.parseInt(feeBpsInput, 10);
        if (Number.isNaN(bps) || bps < 0 || bps > 500) {
          throw new Error("Swap fee BPS must be between 0 and 500.");
        }
        const txHash = await setSwapFeeBpsOnChain(bps);
        setFeedback({
          tone: "success",
          message: `Updated swapFeeBps to ${bps} bps (tx: ${txHash.slice(0, 12)}...).`,
        });
        await fetchRouter();
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update router swap fee.",
        });
      } finally {
        setSubmittingRouterTx(false);
      }
    },
    [address, connect, isWrongNetwork, switchNetwork, feeBpsInput, fetchRouter]
  );

  const handleUpdateTokenPrice = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!address) {
        await connect();
        return;
      }
      if (isWrongNetwork) {
        await switchNetwork();
        return;
      }
      setSubmittingRouterTx(true);
      setFeedback(null);
      try {
        const token = TOKEN_LIST.find(
          (t) => t.address.toLowerCase() === selectedTokenAddress.toLowerCase()
        );
        if (!token || token.isNative) {
          throw new Error("Select a supported ERC-20 token.");
        }
        const priceUsdE18 = ethers.parseUnits(priceUsdInput.trim(), 18);
        const txHash = await setTokenPriceOnChain(
          token.address,
          priceUsdE18,
          token.decimals
        );
        setFeedback({
          tone: "success",
          message: `Updated ${token.symbol} USD price (tx: ${txHash.slice(0, 12)}...).`,
        });
        await fetchRouter();
      } catch (error) {
        setFeedback({
          tone: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update token price.",
        });
      } finally {
        setSubmittingRouterTx(false);
      }
    },
    [
      address,
      connect,
      isWrongNetwork,
      switchNetwork,
      selectedTokenAddress,
      priceUsdInput,
      fetchRouter,
    ]
  );

  return {
    address,
    overview,
    loadingOverview,
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
    searchQuery,
    setSearchQuery,
    feedback,
    setFeedback,
    fetchOverview,
    fetchRouter,
    handleUpdateFeeBps,
    handleUpdateTokenPrice,
  };
}
