export const PUBLIC_TEXT_CONSTANTS = {
  CORE_CAPABILITIES: [
    {
      title: "Cross-Token Atomic Settlement",
      description:
        "Payers settle invoices in MEC, WMEC, mUSDT, mUSDC, or IDRC while merchants receive their chosen settlement asset in one atomic transaction.",
      badge: "MetaPayGateway.payDirect",
    },
    {
      title: "HTTP 402 Paywall Middleware",
      description:
        "Drop-in withMetaPay402 wrapper converts any Next.js API route into a paid micro-service with replay-protected receipt verification.",
      badge: "HTTP 402",
    },
    {
      title: "Multi-Recipient Revenue Splits",
      description:
        "Distribute up to 10 recipients in basis points (totaling 10,000 bps) directly on-chain during invoice settlement.",
      badge: "BPS Splits",
    },
    {
      title: "0x <-> me1 & ME ID Lookup",
      description:
        "Bi-directional EVM and Meta Earth Bech32 address normalization plus verified ME ID status lookup via ME Hub REST.",
      badge: "Identity",
    },
  ],
  ARCHITECTURE_LAYERS: [
    {
      step: "01",
      title: "Off-Chain Invoice or HTTP 402 Challenge",
      detail:
        "Merchant dashboard or protected endpoint issues a bytes32 refId with recipient, target token, target amount, expiry policy, and optional split rules.",
    },
    {
      step: "02",
      title: "On-Chain Exact-Output Swap & Settlement",
      detail:
        "Payer approves ERC-20 (or sends native MEC) with 1% slippage guard; MetaPayGateway swaps via MetaPaySwapRouter and distributes target tokens.",
    },
    {
      step: "03",
      title: "Event Proof & Replay Protection",
      detail:
        "Backend verifies PaymentSettled event log on Chain 400, marks invoice PAID, stores Transaction + Http402Receipt, and unlocks requested API data.",
    },
  ],
  CONTRACT_LINKS: [
    { label: "Meta Earth Chain ID", value: "400" },
    { label: "Native Currency", value: "MEC (18 decimals)" },
    { label: "IDR Stablecoin", value: "IDRC (2 decimals · 1 USD = 16,000 IDRC)" },
  ],
} as const;
