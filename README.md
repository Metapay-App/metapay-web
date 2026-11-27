# Meta Pay Web Application

[![Next.js](https://img.shields.io/badge/Next.js-15.1-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748?logo=prisma)](https://www.prisma.io/)
[![Meta Earth](https://img.shields.io/badge/Meta%20Earth%20Testnet-Chain%20ID%20400-0067FF)](http://118.175.0.249:8545)

Full-stack **Meta Pay** web portal, cross-token checkout, protocol admin console, and **HTTP 402 paywall middleware** built for **Meta Earth Network (Chain ID 400)** — **HARBOR Hackathon · Track 2 (Consumer Products & Payments)**.

---

## Key Features

- **Cross-Token Payment Checkout (`/[lang]/pay/[refId]`)**: Quote live swap rates from `MetaPayGateway.quotePayment`, enforce a 1% slippage guard, approve & settle atomically in **MEC**, **WMEC**, **mUSDT**, **mUSDC**, or **IDRC**, and verify on-chain `PaymentSettled` logs via backend API.
- **Reusable HTTP 402 Middleware (`withMetaPay402`)**: Wraps any Next.js App Router API route to emit standard `HTTP 402 Payment Required` invoices (`PAYMENT_REQUIRED` JSON + checkout URL), verify submitted `(x-metapay-ref, x-metapay-tx)` headers against Chain 400 receipts, prevent replay attacks with PostgreSQL `Http402Receipt`, and unlock protected data.
- **Multi-Recipient Split Payments**: Create invoices with up to 10 basis-point split recipients (`total = 10,000 bps`) settled atomically on-chain.
- **Bi-Directional `0x` <-> `me1` & ME ID Identity**: Canonical EVM hex to Meta Earth Bech32 (`me1...`) conversion plus ME Hub REST ME ID lookup.
- **Testnet Faucet, `MEC <-> WMEC` Wrapper & Router Governance**: Built-in UI to claim testnet `mUSDT`, `mUSDC`, `IDRC`, wrap/unwrap `MEC`, manage merchant API keys, and inspect/update `MetaPaySwapRouter` fees and prices as protocol owner.
- **Localized HARBOR Glassmorphism UI**: Supports Indonesian (`id`, default), English (`en`), and Chinese (`zh`) across `/[lang]/**`.

---

## Architecture Overview

```mermaid
flowchart TB
    Views["Presentation Views & Hooks (Public / Portal / Checkout / Admin)"] -->|"getService(DI_TOKEN)"| DI["@needle-di/core Container (src/core/di/container.ts)"]
    DI --> UseCases["Client Domain UseCases (merchant / invoice / payment / identity / http402 / admin)"]
    UseCases --> DataSources["Client Remote DataSources (apiClient + buildQueryString)"]
    DataSources -->|"HTTP /api/v1/**"| ApiRoutes["Thin Next.js App Router API Handlers"]
    ApiRoutes --> ServerDDD["Server DDD Modules (src/server/modules/**)"]
    ServerDDD --> Prisma["PostgreSQL via Prisma 6"]
    ServerDDD -->|"Verify PaymentSettled"| Rpc["Meta Earth RPC & /api/v1/rpc Proxy"]
    Views -->|"EIP-1193 Wallet Signer"| Rpc
```

### Layer Boundaries

- **`src/client/domain/<module>` & `src/client/data/<module>`**: Separated per feature (`merchant`, `invoice`, `payment`, `identity`, `http402`, `admin`) with zero `@prisma/client` or `src/server/**` imports.
- **`src/core/`**: Shared constants (`abis.json`, `contracts.ts`, `api-routes.ts`, `page-routes.ts`), DI container (`container.ts`), `apiClient`, `wallet-client.ts`, `address.ts` (`0x` <-> `me1`), formatting utilities, and `id`/`en`/`zh` dictionaries.
- **`src/server/modules/<module>`**: Server-only DDD `domain` / `application` / `infrastructure` modules (`merchant`, `invoice`, `payment`, `identity`, `http402`, `admin`), Zod validation, fail-closed on-chain verification, and structured `{ message, code, details? }` errors.

---

## Application Portals & Routes

All UI routes are localized under `/[lang]` where `lang` is `id` (default), `en`, or `zh`:

| Area | Route | Purpose |
| --- | --- | --- |
| **Public** | `/[lang]` | Landing page, live on-chain `quotePayment` simulator, supported tokens, architecture flow |
| **Public** | `/[lang]/about` | Protocol architecture overview, live `0x` <-> `me1` converter, deployed contracts registry |
| **Public** | `/[lang]/contact` | Merchant integration & support contact page |
| **Merchant / User Portal** | `/[lang]/portal` | Wallet token balances (`MEC`, `WMEC`, `mUSDT`, `mUSDC`, `IDRC`) + Create Invoice form (`FIXED` / `NO_LIMIT`, BPS splits) |
| **Merchant / User Portal** | `/[lang]/portal/invoices` | Invoice CRUD list, search/status filter, QR verification tag & detail modal, cancel invoice confirmation |
| **Merchant / User Portal** | `/[lang]/portal/history` | Per-wallet settled transaction history filtered by `all` / `payer` / `recipient` |
| **Merchant / User Portal** | `/[lang]/portal/playground` | Interactive live HTTP 402 demo (`402` challenge -> pay with any token -> `200 OK` unlocked payload) |
| **Merchant / User Portal** | `/[lang]/portal/settings` | Merchant profile & API key registration/rotation, `mUSDT`/`mUSDC`/`IDRC` faucet, `MEC` <-> `WMEC` wrap/unwrap |
| **Hosted Checkout** | `/[lang]/pay/[refId]` | Public shareable payment checkout page with token selector, quote + 1% slippage guard, and receipt verification |
| **Admin Portal** | `/[lang]/admin` | Global protocol KPIs, router reserve summary, and latest settled transactions |
| **Admin Portal** | `/[lang]/admin/router` | `MetaPaySwapRouter` owner console (`setSwapFeeBps`, `setTokenPrice`, router reserve balances) |
| **Admin Portal** | `/[lang]/admin/merchants` | Registered merchants directory & HTTP 402 audit receipts log |
| **Admin Portal** | `/[lang]/admin/transactions` | Searchable global transaction ledger across all merchants and payers |

---

## API Endpoints (`/api/v1/**`)

| Method & Path | Purpose |
| --- | --- |
| `POST /api/v1/rpc` | Same-origin JSON-RPC proxy to `ME_TESTNET_RPC_URL` |
| `POST /api/v1/merchants` | Register merchant or rotate API key (`walletAddress`, `name`) |
| `GET /api/v1/merchants/me` | Fetch merchant profile by `x-api-key` header or `?walletAddress=` |
| `POST /api/v1/invoices` | Create invoice (`recipient`, `targetToken`, `targetAmount`, `expiryType`, `splits?`, optional `x-api-key`) |
| `GET /api/v1/invoices` | List invoices (`?merchantId=&recipient=&status=&limit=&offset=`) |
| `GET /api/v1/invoices/[refId]` | Fetch single invoice detail by `refId` |
| `POST /api/v1/invoices/[refId]/cancel` | Cancel pending invoice (`x-api-key` or `{ actorAddress }`) |
| `POST /api/v1/payments/verify` | Verify on-chain `PaymentSettled` receipt (`{ refId, txHash }`) and sync DB |
| `GET /api/v1/payments/history` | Query verified transactions (`?address=&role=&token=&limit=&offset=`) |
| `GET /api/v1/identity/[address]` | Normalize `0x` <-> `me1` and check ME ID via ME Hub REST |
| `GET /api/v1/demo/premium-data` | Protected by `withMetaPay402` (returns `402` challenge or `200` with `x-metapay-ref` & `x-metapay-tx`) |
| `GET /api/v1/admin/overview` | Protocol KPIs, merchants, HTTP 402 receipts, and recent transactions |

### Using `withMetaPay402` Middleware

```ts
import { withMetaPay402 } from "@/server/modules/http402/application/with-metapay-402";
import { ok } from "@/server/shared/http/response";

export const GET = withMetaPay402(
  async (_req, context) => {
    return ok({
      unlocked: true,
      refId: context.refId,
      txHash: context.txHash,
      payer: context.payment.payerAddress,
      data: { signal: "premium-payload" },
    });
  },
  {
    recipient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    targetToken: "mUSDT",
    targetAmount: "1000000", // 1 mUSDT (6 decimals)
    expirySeconds: 300,
    description: "Premium Market Data API",
  }
);
```

---

## Live Smart Contract Configuration (`meTestnet` · Chain ID 400)

The `.env` and `.env.example` files are pre-configured with the deployed Meta Earth Testnet contracts:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CHAIN_ID` | `400` |
| `ME_TESTNET_RPC_URL` | `http://118.175.0.249:8545` |
| `ME_HUB_REST_URL` | `http://118.175.0.249:1317` |
| `NEXT_PUBLIC_GATEWAY_ADDRESS` | `0xd407227189D8D78E5FcAa61A9B64052A5555DAf6` |
| `NEXT_PUBLIC_ROUTER_ADDRESS` | `0x66b0F06a3960f31B0C6a7132917fF12cD6e37Eb2` |
| `NEXT_PUBLIC_WMEC_ADDRESS` | `0x73bc53fB104CA39E5FBfaf870ed185C94D81893E` |
| `NEXT_PUBLIC_MUSDT_ADDRESS` | `0x427C9625E57d6c47d2850a2C5366AB094515C2C3` |
| `NEXT_PUBLIC_MUSDC_ADDRESS` | `0x61F2D51798C9644c9A42BD13fa3f13846B53aac8` |
| `NEXT_PUBLIC_IDRC_ADDRESS` | `0xb4d995c522e368360613E913160A1ACF5b1bdb1c` |

---

## Running Locally

### Prerequisites

- **Node.js** `>= 20` and `npm`
- **PostgreSQL** `>= 15` running locally or remotely
- Browser EIP-1193 wallet (e.g., MetaMask or OKX Wallet)

### 1. Install Dependencies

```bash
cd /Users/gadget/Development/metapay/metapay-web
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update `DATABASE_URL` (and contract addresses if using a local Hardhat node instead of `meTestnet`) in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/metapay?schema=public"
NEXT_PUBLIC_CHAIN_ID="400"
ME_TESTNET_RPC_URL="http://118.175.0.249:8545"
ME_HUB_REST_URL="http://118.175.0.249:1317"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Apply Migrations

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

*(For quick schema prototyping without creating new migration files, you can also use `npm run prisma:push`, and `npm run prisma:studio` to inspect tables.)*

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` (redirects/serves `/id` by default, or visit `/en` / `/zh`).

---

## Testing & Quality Checks

| Check | Command | Purpose |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | Strict `tsc --noEmit` check across client, core, server, and app routes. |
| Unit Tests | `npm test` | Runs Vitest suite (`address`, `create-invoice.usecase`, `with-metapay-402`). |
| ESLint | `npm run lint` | Runs `next lint` (enforces zero `any` and Next.js rules). |
| Prisma Schema | `npm run prisma:validate` | Validates `prisma/schema.prisma`. |
| Production Build | `npm run build` | Builds optimized Next.js production bundle. |

---

## Production Deployment Guide

### 1. Provision PostgreSQL & Apply Migrations

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/metapay?schema=public"
npm run prisma:generate
npm run prisma:migrate:deploy
```

### 2. Configure Production Environment Variables

Set all variables from `.env.example` in your hosting platform (Vercel, Railway, Fly.io, or Docker/PM2 server), ensuring `NEXT_PUBLIC_APP_URL` points to your public HTTPS domain so generated HTTP 402 `checkoutUrl` links resolve publicly.

> **Important**: `src/app/api/v1/rpc/route.ts` proxies client JSON-RPC calls server-side to `ME_TESTNET_RPC_URL` (`http://118.175.0.249:8545`), preventing mixed-content HTTP errors when hosting the frontend over HTTPS. Make sure your server host can reach `ME_TESTNET_RPC_URL` and `ME_HUB_REST_URL`.

### 3. Build & Start

```bash
npm run build
npm run start
```
# metapay-web
