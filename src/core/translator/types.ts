export type Locale = "id" | "en" | "zh";

export const DEFAULT_LOCALE: Locale = "id";
export const SUPPORTED_LOCALES: readonly Locale[] = ["id", "en", "zh"] as const;

export interface MetaPayDictionary {
  common: {
    appName: string;
    tagline: string;
    networkName: string;
    connectWallet: string;
    connecting: string;
    switchNetwork: string;
    disconnect: string;
    loading: string;
    submit: string;
    cancel: string;
    close: string;
    refresh: string;
    copy: string;
    copied: string;
    searchPlaceholder: string;
    walletRequired: string;
    connectedAs: string;
    meIdBadge: string;
    noData: string;
    viewExplorer: string;
  };
  nav: {
    home: string;
    about: string;
    contact: string;
    portal: string;
    admin: string;
    dashboard: string;
    invoices: string;
    history: string;
    playground: string;
    settings: string;
    adminOverview: string;
    adminRouter: string;
    adminMerchants: string;
    adminTransactions: string;
  };
  publicSite: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaPortal: string;
    ctaPlayground: string;
    ctaAdmin: string;
    supportedTokensTitle: string;
    architectureTitle: string;
    featuresTitle: string;
    aboutTitle: string;
    aboutSubtitle: string;
    contactTitle: string;
    contactSubtitle: string;
    contactSuccess: string;
  };
  invoice: {
    createTitle: string;
    recipientLabel: string;
    targetTokenLabel: string;
    targetAmountLabel: string;
    expiryTypeFixed: string;
    expiryTypeNoLimit: string;
    splitPaymentLabel: string;
    addSplit: string;
    descriptionLabel: string;
    statusPending: string;
    statusPaid: string;
    statusExpired: string;
    statusCancelled: string;
    cancelInvoice: string;
    confirmCancel: string;
    openCheckout: string;
  };
  payment: {
    payNow: string;
    approveAndPay: string;
    payWithToken: string;
    estimatedPay: string;
    maxSlippageNote: string;
    meIdVerified: string;
    paymentSuccess: string;
    verifyingOnChain: string;
    invoiceUnavailable: string;
  };
  http402: {
    title: string;
    subtitle: string;
    paymentRequired: string;
    unlocked: string;
    triggerRequest: string;
    settleAndRetry: string;
    receiptTitle: string;
  };
  portal: {
    title: string;
    overviewSubtitle: string;
    faucetTitle: string;
    faucetClaim: string;
    wrapMec: string;
    unwrapWmec: string;
    merchantProfileTitle: string;
    registerMerchant: string;
    rotateApiKey: string;
  };
  admin: {
    title: string;
    overviewSubtitle: string;
    routerTitle: string;
    updateFeeBps: string;
    updateTokenPrice: string;
    merchantsTitle: string;
    receiptsTitle: string;
    transactionsTitle: string;
  };
}
