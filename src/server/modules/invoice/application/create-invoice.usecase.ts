import crypto from "crypto";
import { getAddress, isAddress, keccak256, toUtf8Bytes } from "ethers";
import { findTokenBySymbol } from "@/core/constants/contracts";
import { normalizeToEvmAndMe } from "@/core/utils/address";
import {
  BadRequestError,
  ValidationError,
} from "@/server/shared/errors/app-error";
import {
  toInvoiceDto,
  type ExpiryType,
  type InvoiceDto,
  type InvoiceSource,
  type SplitEntry,
} from "../domain/invoice.entity";
import type { InvoiceRepository } from "../domain/invoice.repository";

const MAX_BPS = 10_000;
const MAX_SPLITS = 10;

export interface CreateInvoiceSplitInput {
  recipient: string;
  bps: number;
}

export interface CreateInvoiceCommand {
  merchantId?: string | null;
  recipient: string;
  targetToken: string;
  targetAmount: string;
  expiryType: ExpiryType;
  expiresAt?: string | null;
  expirySeconds?: number | null;
  splits?: CreateInvoiceSplitInput[];
  source?: InvoiceSource;
  description?: string | null;
}

function resolveTargetTokenAddress(tokenInput: string): string {
  const trimmed = tokenInput.trim();
  const bySymbol = findTokenBySymbol(trimmed);
  if (bySymbol) {
    return getAddress(bySymbol.address);
  }
  if (isAddress(trimmed)) {
    return getAddress(trimmed);
  }
  throw new ValidationError(
    `Unsupported targetToken: ${tokenInput}`,
    "INVALID_TARGET_TOKEN"
  );
}

export class CreateInvoiceUseCase {
  constructor(private readonly invoiceRepo: InvoiceRepository) {}

  public async execute(command: CreateInvoiceCommand): Promise<InvoiceDto> {
    let recipientPair;
    try {
      recipientPair = normalizeToEvmAndMe(command.recipient);
    } catch (err) {
      throw new BadRequestError(
        err instanceof Error ? err.message : "Invalid recipient address",
        "INVALID_RECIPIENT"
      );
    }

    const targetToken = resolveTargetTokenAddress(command.targetToken);

    if (!/^\d+$/.test(command.targetAmount.trim())) {
      throw new ValidationError(
        "targetAmount must be an integer string in token base units",
        "INVALID_TARGET_AMOUNT"
      );
    }
    const parsedAmount = BigInt(command.targetAmount.trim());
    if (parsedAmount <= 0n) {
      throw new ValidationError(
        "targetAmount must be greater than zero",
        "INVALID_TARGET_AMOUNT"
      );
    }

    let expiresAt: Date | null = null;
    if (command.expiryType === "FIXED") {
      if (command.expirySeconds !== undefined && command.expirySeconds !== null) {
        if (
          !Number.isInteger(command.expirySeconds) ||
          command.expirySeconds <= 0
        ) {
          throw new ValidationError(
            "expirySeconds must be a positive integer for FIXED invoices",
            "INVALID_EXPIRY"
          );
        }
        expiresAt = new Date(Date.now() + command.expirySeconds * 1000);
      } else if (command.expiresAt) {
        const candidate = new Date(command.expiresAt);
        if (Number.isNaN(candidate.getTime()) || candidate.getTime() <= Date.now()) {
          throw new ValidationError(
            "expiresAt must be a valid future ISO timestamp for FIXED invoices",
            "INVALID_EXPIRY"
          );
        }
        expiresAt = candidate;
      } else {
        throw new ValidationError(
          "FIXED invoice requires expiresAt or expirySeconds",
          "MISSING_EXPIRY"
        );
      }
    }

    const rawSplits = command.splits ?? [];
    if (rawSplits.length > MAX_SPLITS) {
      throw new ValidationError(
        `Maximum ${MAX_SPLITS} split recipients allowed`,
        "TOO_MANY_SPLITS"
      );
    }

    const normalizedSplits: SplitEntry[] = [];
    if (rawSplits.length > 0) {
      let totalBps = 0;
      for (const s of rawSplits) {
        if (!Number.isInteger(s.bps) || s.bps <= 0) {
          throw new ValidationError(
            "Each split bps must be a positive integer",
            "INVALID_SPLIT_BPS"
          );
        }
        let splitPair;
        try {
          splitPair = normalizeToEvmAndMe(s.recipient);
        } catch (err) {
          throw new ValidationError(
            err instanceof Error ? err.message : "Invalid split recipient address",
            "INVALID_SPLIT_RECIPIENT"
          );
        }
        totalBps += s.bps;
        normalizedSplits.push({
          recipient: splitPair.evmAddress,
          recipientMeAddress: splitPair.meAddress,
          bps: s.bps,
        });
      }
      if (totalBps !== MAX_BPS) {
        throw new ValidationError(
          `Split bps must sum to ${MAX_BPS}, got ${totalBps}`,
          "INVALID_SPLIT_TOTAL"
        );
      }
    }

    const refId = keccak256(toUtf8Bytes(crypto.randomUUID()));

    const created = await this.invoiceRepo.create({
      refId,
      merchantId: command.merchantId ?? null,
      recipientAddress: recipientPair.evmAddress,
      recipientMeAddress: recipientPair.meAddress,
      targetToken,
      targetAmount: parsedAmount.toString(),
      expiryType: command.expiryType,
      expiresAt,
      splits: normalizedSplits,
      source: command.source ?? "DASHBOARD",
      description: command.description?.trim() || null,
    });

    return toInvoiceDto(created);
  }
}
