"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CHAIN_CONFIG } from "@/core/constants/contracts";
import {
  IDENTITY_DI_TOKENS,
  MERCHANT_DI_TOKENS,
  getService,
} from "@/core/di/container";
import { convert0xToMeAddress } from "@/core/utils/address";
import {
  connectEvmWallet,
  getAllWalletBalancesOnChain,
  getConnectedWalletSnapshot,
  hasInjectedWallet,
  subscribeWalletEvents,
  switchToMetaEarthChain,
} from "@/core/blockchain/wallet-client";
import type { MeIdentityProfile } from "@/client/domain/identity/entity/identity_entity";
import type { MerchantProfile } from "@/client/domain/merchant/entity/merchant_entity";

const API_KEY_STORAGE_PREFIX = "metapay_api_key_";

export interface WalletContextValue {
  address: string | null;
  meAddress: string | null;
  chainId: number | null;
  isWrongNetwork: boolean;
  isConnecting: boolean;
  hasProvider: boolean;
  meIdentity: MeIdentityProfile | null;
  balances: Record<string, string>;
  merchantProfile: MerchantProfile | null;
  savedApiKey: string;
  walletError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  refreshWalletState: () => Promise<void>;
  saveMerchantApiKey: (wallet: string, apiKey: string) => void;
  setMerchantProfile: (profile: MerchantProfile | null) => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasProvider, setHasProvider] = useState(false);
  const [meIdentity, setMeIdentity] = useState<MeIdentityProfile | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [merchantProfile, setMerchantProfile] =
    useState<MerchantProfile | null>(null);
  const [savedApiKey, setSavedApiKey] = useState("");
  const [walletError, setWalletError] = useState<string | null>(null);

  const meAddress = useMemo(() => {
    if (!address) return null;
    try {
      return convert0xToMeAddress(address);
    } catch {
      return null;
    }
  }, [address]);

  const isWrongNetwork =
    address !== null && chainId !== null && chainId !== CHAIN_CONFIG.chainId;

  const hydrateAddressState = useCallback(async (wallet: string) => {
    const getMeIdentity = getService(IDENTITY_DI_TOKENS.GetMeIdentityUseCase);
    const getMerchantByWallet = getService(
      MERCHANT_DI_TOKENS.GetMerchantByWalletUseCase
    );
    if (typeof window !== "undefined") {
      const storedKey = window.localStorage.getItem(
        `${API_KEY_STORAGE_PREFIX}${wallet.toLowerCase()}`
      );
      setSavedApiKey(storedKey ?? "");
    }

    const [identityRes, merchantRes, balancesRes] = await Promise.allSettled([
      getMeIdentity.execute(wallet),
      getMerchantByWallet.execute(wallet),
      getAllWalletBalancesOnChain(wallet),
    ]);

    if (identityRes.status === "fulfilled") {
      setMeIdentity(identityRes.value);
    }
    if (merchantRes.status === "fulfilled") {
      setMerchantProfile(merchantRes.value);
    }
    if (balancesRes.status === "fulfilled") {
      setBalances(balancesRes.value);
    }
  }, []);

  const refreshWalletState = useCallback(async () => {
    if (!address) return;
    await hydrateAddressState(address);
  }, [address, hydrateAddressState]);

  useEffect(() => {
    setHasProvider(hasInjectedWallet());
    let active = true;

    getConnectedWalletSnapshot()
      .then((snap) => {
        if (!active) return;
        setAddress(snap.address);
        setChainId(snap.chainId);
        if (snap.address) {
          void hydrateAddressState(snap.address);
        }
      })
      .catch(() => {
        // Silent initial wallet hydration fallback
      });

    const unsubscribe = subscribeWalletEvents(
      (accounts) => {
        const nextAddr = accounts[0] ?? null;
        setAddress(nextAddr);
        setWalletError(null);
        if (nextAddr) {
          void hydrateAddressState(nextAddr);
        } else {
          setMeIdentity(null);
          setBalances({});
          setMerchantProfile(null);
          setSavedApiKey("");
        }
      },
      (chainHex) => {
        const parsed = Number.parseInt(chainHex, 16);
        setChainId(Number.isNaN(parsed) ? null : parsed);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrateAddressState]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setWalletError(null);
    try {
      const result = await connectEvmWallet();
      setAddress(result.address);
      setChainId(result.chainId);
      await hydrateAddressState(result.address);
    } catch (error) {
      setWalletError(
        error instanceof Error ? error.message : "Failed to connect wallet."
      );
    } finally {
      setIsConnecting(false);
    }
  }, [hydrateAddressState]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setMeIdentity(null);
    setBalances({});
    setMerchantProfile(null);
    setSavedApiKey("");
    setWalletError(null);
  }, []);

  const switchNetwork = useCallback(async () => {
    setWalletError(null);
    try {
      await switchToMetaEarthChain();
      const snap = await getConnectedWalletSnapshot();
      setChainId(snap.chainId);
      if (snap.address) {
        await hydrateAddressState(snap.address);
      }
    } catch (error) {
      setWalletError(
        error instanceof Error
          ? error.message
          : "Failed to switch to Meta Earth Testnet."
      );
    }
  }, [hydrateAddressState]);

  const saveMerchantApiKey = useCallback((wallet: string, apiKey: string) => {
    setSavedApiKey(apiKey);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `${API_KEY_STORAGE_PREFIX}${wallet.toLowerCase()}`,
        apiKey
      );
    }
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      meAddress,
      chainId,
      isWrongNetwork,
      isConnecting,
      hasProvider,
      meIdentity,
      balances,
      merchantProfile,
      savedApiKey,
      walletError,
      connect,
      disconnect,
      switchNetwork,
      refreshWalletState,
      saveMerchantApiKey,
      setMerchantProfile,
    }),
    [
      address,
      meAddress,
      chainId,
      isWrongNetwork,
      isConnecting,
      hasProvider,
      meIdentity,
      balances,
      merchantProfile,
      savedApiKey,
      walletError,
      connect,
      disconnect,
      switchNetwork,
      refreshWalletState,
      saveMerchantApiKey,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
