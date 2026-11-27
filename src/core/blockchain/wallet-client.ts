import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  ethers,
  type Eip1193Provider,
} from "ethers";
import {
  CHAIN_CONFIG,
  CONTRACT_ABIS,
  CONTRACT_ADDRESSES,
  TOKEN_LIST,
  type TokenConfig,
} from "../constants/contracts";
import { API_ROUTES } from "../constants/api-routes";

export interface SplitRuleParam {
  recipient: string;
  bps: number;
}

export interface ExecutePayDirectParams {
  refId: string;
  recipient: string;
  targetToken: string;
  targetAmount: string;
  expiresAtUnix: number;
  splits: SplitRuleParam[];
  payToken: string;
  maxPayAmount: bigint;
}

export interface RouterGovernanceSnapshot {
  ownerAddress: string;
  swapFeeBps: number;
  tokens: Array<{
    token: TokenConfig;
    priceUsdE18: string;
    routerLiquidity: string;
  }>;
}

interface EthereumWindow extends Window {
  ethereum?: Eip1193Provider & {
    on?: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener?: (
      event: string,
      listener: (...args: unknown[]) => void
    ) => void;
  };
}

function getInjectedEthereum() {
  if (typeof window === "undefined") return undefined;
  return (window as EthereumWindow).ethereum;
}

export function hasInjectedWallet(): boolean {
  return Boolean(getInjectedEthereum());
}

export function getReadProvider(): JsonRpcProvider {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:3000";
  return new JsonRpcProvider(`${origin}${API_ROUTES.RPC}`, undefined, {
    staticNetwork: true,
  });
}

export async function connectEvmWallet(): Promise<{
  address: string;
  chainId: number;
}> {
  const ethereum = getInjectedEthereum();
  if (!ethereum) {
    throw new Error("No EVM browser wallet found (e.g. MetaMask / OKX Wallet).");
  }
  const provider = new BrowserProvider(ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { address, chainId: Number(network.chainId) };
}

export async function getConnectedWalletSnapshot(): Promise<{
  address: string | null;
  chainId: number | null;
}> {
  const ethereum = getInjectedEthereum();
  if (!ethereum) {
    return { address: null, chainId: null };
  }
  const provider = new BrowserProvider(ethereum);
  const accounts = (await provider.send("eth_accounts", [])) as string[];
  const network = await provider.getNetwork();
  return {
    address: accounts[0] ? ethers.getAddress(accounts[0]) : null,
    chainId: Number(network.chainId),
  };
}

export async function switchToMetaEarthChain(): Promise<void> {
  const ethereum = getInjectedEthereum();
  if (!ethereum) {
    throw new Error("No EVM browser wallet found.");
  }
  const hexChainId = `0x${CHAIN_CONFIG.chainId.toString(16)}`;
  const provider = new BrowserProvider(ethereum);

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: hexChainId }]);
  } catch (err: unknown) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? Number((err as { code: unknown }).code)
        : 0;
    if (code === 4902) {
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://127.0.0.1:3000";
      await provider.send("wallet_addEthereumChain", [
        {
          chainId: hexChainId,
          chainName: CHAIN_CONFIG.name,
          nativeCurrency: CHAIN_CONFIG.nativeCurrency,
          rpcUrls: [`${origin}${API_ROUTES.RPC}`],
        },
      ]);
      return;
    }
    throw err;
  }
}

export function subscribeWalletEvents(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainIdHex: string) => void
): () => void {
  const ethereum = getInjectedEthereum();
  if (!ethereum?.on || !ethereum.removeListener) {
    return () => {};
  }

  const accountsHandler = (args: unknown) => {
    if (Array.isArray(args)) {
      onAccountsChanged(args.map(String));
    }
  };
  const chainHandler = (chainHex: unknown) => {
    onChainChanged(String(chainHex));
  };

  ethereum.on("accountsChanged", accountsHandler);
  ethereum.on("chainChanged", chainHandler);

  return () => {
    ethereum.removeListener?.("accountsChanged", accountsHandler);
    ethereum.removeListener?.("chainChanged", chainHandler);
  };
}

async function getBrowserSigner() {
  const ethereum = getInjectedEthereum();
  if (!ethereum) {
    throw new Error("No EVM browser wallet found.");
  }
  const provider = new BrowserProvider(ethereum);
  return provider.getSigner();
}

export async function quotePaymentOnChain(
  payToken: string,
  targetToken: string,
  targetAmountRaw: string
): Promise<bigint> {
  const provider = getReadProvider();
  const gateway = new Contract(
    CONTRACT_ADDRESSES.gateway,
    CONTRACT_ABIS.MetaPayGateway,
    provider
  );
  const quoted: bigint = await gateway.quotePayment(
    payToken,
    targetToken,
    BigInt(targetAmountRaw)
  );
  return quoted;
}

export async function getTokenBalanceOnChain(
  walletAddress: string,
  token: TokenConfig
): Promise<bigint> {
  const provider = getReadProvider();
  if (token.isNative || token.address === ethers.ZeroAddress) {
    return provider.getBalance(walletAddress);
  }
  const erc20 = new Contract(token.address, CONTRACT_ABIS.MockERC20, provider);
  const bal: bigint = await erc20.balanceOf(walletAddress);
  return bal;
}

export async function getAllWalletBalancesOnChain(
  walletAddress: string
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    TOKEN_LIST.map(async (token) => {
      const balance = await getTokenBalanceOnChain(walletAddress, token);
      return [token.symbol, balance.toString()] as const;
    })
  );
  return Object.fromEntries(entries);
}

export async function executePayDirectOnChain(
  params: ExecutePayDirectParams
): Promise<string> {
  const signer = await getBrowserSigner();
  const signerAddress = await signer.getAddress();
  const isNativePay = params.payToken === ethers.ZeroAddress;

  if (!isNativePay) {
    const erc20 = new Contract(params.payToken, CONTRACT_ABIS.MockERC20, signer);
    const currentAllowance: bigint = await erc20.allowance(
      signerAddress,
      CONTRACT_ADDRESSES.gateway
    );
    if (currentAllowance < params.maxPayAmount) {
      const approveTx = await erc20.approve(
        CONTRACT_ADDRESSES.gateway,
        params.maxPayAmount
      );
      await approveTx.wait();
    }
  }

  const gateway = new Contract(
    CONTRACT_ADDRESSES.gateway,
    CONTRACT_ABIS.MetaPayGateway,
    signer
  );

  const tx = await gateway.payDirect(
    params.refId,
    params.recipient,
    params.targetToken,
    BigInt(params.targetAmount),
    BigInt(params.expiresAtUnix),
    params.splits.map((s) => ({ recipient: s.recipient, bps: s.bps })),
    params.payToken,
    params.maxPayAmount,
    isNativePay ? { value: params.maxPayAmount } : {}
  );

  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}

export async function claimFaucetOnChain(tokenAddress: string): Promise<string> {
  const signer = await getBrowserSigner();
  const tokenContract = new Contract(
    tokenAddress,
    CONTRACT_ABIS.MockERC20,
    signer
  );
  const tx = await tokenContract.faucet();
  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}

export async function wrapMecOnChain(amountWei: bigint): Promise<string> {
  const signer = await getBrowserSigner();
  const wmec = new Contract(
    CONTRACT_ADDRESSES.wmec,
    CONTRACT_ABIS.WMEC,
    signer
  );
  const tx = await wmec.deposit({ value: amountWei });
  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}

export async function unwrapWmecOnChain(amountWei: bigint): Promise<string> {
  const signer = await getBrowserSigner();
  const wmec = new Contract(
    CONTRACT_ADDRESSES.wmec,
    CONTRACT_ABIS.WMEC,
    signer
  );
  const tx = await wmec.withdraw(amountWei);
  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}

export async function getRouterGovernanceSnapshot(): Promise<RouterGovernanceSnapshot> {
  const provider = getReadProvider();
  const router = new Contract(
    CONTRACT_ADDRESSES.router,
    CONTRACT_ABIS.MetaPaySwapRouter,
    provider
  );

  const [ownerAddress, feeBpsRaw] = await Promise.all([
    router.owner() as Promise<string>,
    router.swapFeeBps() as Promise<bigint>,
  ]);

  const erc20Tokens = TOKEN_LIST.filter((t) => !t.isNative);
  const tokens = await Promise.all(
    erc20Tokens.map(async (token) => {
      const erc20 = new Contract(
        token.address,
        CONTRACT_ABIS.MockERC20,
        provider
      );
      const [priceRaw, liquidityRaw] = await Promise.all([
        router.tokenPriceUsdE18(token.address) as Promise<bigint>,
        erc20.balanceOf(CONTRACT_ADDRESSES.router) as Promise<bigint>,
      ]);
      return {
        token,
        priceUsdE18: priceRaw.toString(),
        routerLiquidity: liquidityRaw.toString(),
      };
    })
  );

  return {
    ownerAddress,
    swapFeeBps: Number(feeBpsRaw),
    tokens,
  };
}

export async function setSwapFeeBpsOnChain(newFeeBps: number): Promise<string> {
  const signer = await getBrowserSigner();
  const router = new Contract(
    CONTRACT_ADDRESSES.router,
    CONTRACT_ABIS.MetaPaySwapRouter,
    signer
  );
  const tx = await router.setSwapFeeBps(newFeeBps);
  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}

export async function setTokenPriceOnChain(
  tokenAddress: string,
  priceUsdE18: bigint,
  decimals: number
): Promise<string> {
  const signer = await getBrowserSigner();
  const router = new Contract(
    CONTRACT_ADDRESSES.router,
    CONTRACT_ABIS.MetaPaySwapRouter,
    signer
  );
  const tx = await router.setTokenPrice(tokenAddress, priceUsdE18, decimals);
  const receipt = await tx.wait();
  return String(receipt?.hash ?? tx.hash);
}
