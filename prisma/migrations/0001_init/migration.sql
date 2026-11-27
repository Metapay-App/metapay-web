-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ExpiryType" AS ENUM ('FIXED', 'NO_LIMIT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceSource" AS ENUM ('DASHBOARD', 'API', 'HTTP_402');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "meAddress" TEXT NOT NULL,
    "meId" TEXT,
    "name" TEXT NOT NULL,
    "apiKeyPrefix" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "merchantId" TEXT,
    "recipientAddress" TEXT NOT NULL,
    "recipientMeAddress" TEXT NOT NULL,
    "targetToken" TEXT NOT NULL,
    "targetAmount" TEXT NOT NULL,
    "expiryType" "ExpiryType" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "splits" JSONB,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "source" "InvoiceSource" NOT NULL DEFAULT 'DASHBOARD',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "payerAddress" TEXT NOT NULL,
    "payerMeAddress" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "payToken" TEXT NOT NULL,
    "payAmount" TEXT NOT NULL,
    "targetToken" TEXT NOT NULL,
    "targetAmount" TEXT NOT NULL,
    "isSplit" BOOLEAN NOT NULL DEFAULT false,
    "splits" JSONB,
    "blockNumber" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Http402Receipt" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "payerAddress" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Http402Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_walletAddress_key" ON "Merchant"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_apiKeyPrefix_key" ON "Merchant"("apiKeyPrefix");

-- CreateIndex
CREATE INDEX "Merchant_meAddress_idx" ON "Merchant"("meAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_refId_key" ON "Invoice"("refId");

-- CreateIndex
CREATE INDEX "Invoice_merchantId_idx" ON "Invoice"("merchantId");

-- CreateIndex
CREATE INDEX "Invoice_recipientAddress_idx" ON "Invoice"("recipientAddress");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_refId_idx" ON "Transaction"("refId");

-- CreateIndex
CREATE INDEX "Transaction_payerAddress_idx" ON "Transaction"("payerAddress");

-- CreateIndex
CREATE INDEX "Transaction_recipientAddress_idx" ON "Transaction"("recipientAddress");

-- CreateIndex
CREATE INDEX "Transaction_paidAt_idx" ON "Transaction"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "Http402Receipt_refId_key" ON "Http402Receipt"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "Http402Receipt_txHash_key" ON "Http402Receipt"("txHash");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

