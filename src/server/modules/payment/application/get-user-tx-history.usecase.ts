import { getAddress, isAddress } from "ethers";
import { findTokenBySymbol } from "@/core/constants/contracts";
import { normalizeToEvmAndMe } from "@/core/utils/address";
import { BadRequestError } from "@/server/shared/errors/app-error";
import {
  toTransactionDto,
  type TransactionDto,
} from "../domain/transaction.entity";
import type {
  HistoryRoleFilter,
  TransactionRepository,
} from "../domain/transaction.repository";

export interface GetUserTxHistoryCommand {
  address: string;
  role?: HistoryRoleFilter;
  token?: string;
  limit?: number;
  offset?: number;
}

export class GetUserTxHistoryUseCase {
  constructor(private readonly txRepo: TransactionRepository) {}

  public async execute(
    command: GetUserTxHistoryCommand
  ): Promise<TransactionDto[]> {
    let evmAddress: string;
    try {
      evmAddress = normalizeToEvmAndMe(command.address).evmAddress;
    } catch (err) {
      throw new BadRequestError(
        err instanceof Error ? err.message : "Invalid wallet address",
        "INVALID_ADDRESS"
      );
    }

    let tokenAddress: string | undefined;
    if (command.token && command.token.trim().length > 0) {
      const trimmed = command.token.trim();
      const bySymbol = findTokenBySymbol(trimmed);
      if (bySymbol) {
        tokenAddress = getAddress(bySymbol.address);
      } else if (isAddress(trimmed)) {
        tokenAddress = getAddress(trimmed);
      } else {
        throw new BadRequestError(
          `Invalid token filter: ${command.token}`,
          "INVALID_TOKEN"
        );
      }
    }

    const limit = Math.min(Math.max(command.limit ?? 30, 1), 100);
    const offset = Math.max(command.offset ?? 0, 0);

    const rows = await this.txRepo.listByUser({
      address: evmAddress,
      role: command.role ?? "all",
      token: tokenAddress,
      limit,
      offset,
    });

    return rows.map(toTransactionDto);
  }
}
