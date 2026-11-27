import { describe, expect, it } from "vitest";
import { CONTRACT_ADDRESSES } from "@/core/constants/contracts";
import { convert0xToMeAddress } from "@/core/utils/address";
import { ValidationError } from "@/server/shared/errors/app-error";
import type { InvoiceEntity } from "../../domain/invoice.entity";
import type {
  CreateInvoiceRecordInput,
  InvoiceRepository,
  ListInvoicesFilter,
} from "../../domain/invoice.repository";
import { CreateInvoiceUseCase } from "../create-invoice.usecase";

class InMemoryInvoiceRepository implements InvoiceRepository {
  private readonly store = new Map<string, InvoiceEntity>();

  public async create(input: CreateInvoiceRecordInput): Promise<InvoiceEntity> {
    const now = new Date();
    const entity: InvoiceEntity = {
      id: `inv_${this.store.size + 1}`,
      refId: input.refId,
      merchantId: input.merchantId,
      recipientAddress: input.recipientAddress,
      recipientMeAddress: input.recipientMeAddress,
      targetToken: input.targetToken,
      targetAmount: input.targetAmount,
      expiryType: input.expiryType,
      expiresAt: input.expiresAt,
      splits: input.splits,
      status: "PENDING",
      source: input.source,
      description: input.description,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(entity.refId, entity);
    return entity;
  }

  public async findByRefId(refId: string): Promise<InvoiceEntity | null> {
    return this.store.get(refId) ?? null;
  }

  public async list(_filter: ListInvoicesFilter): Promise<InvoiceEntity[]> {
    return Array.from(this.store.values());
  }

  public async updateStatus(
    refId: string,
    status: InvoiceEntity["status"]
  ): Promise<InvoiceEntity> {
    const found = this.store.get(refId);
    if (!found) {
      throw new Error("Invoice not found");
    }
    const updated: InvoiceEntity = { ...found, status, updatedAt: new Date() };
    this.store.set(refId, updated);
    return updated;
  }
}

describe("CreateInvoiceUseCase", () => {
  const addrA = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const addrB = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  it("creates a NO_LIMIT invoice from a me1 recipient and IDRC symbol", async function () {
    const repo = new InMemoryInvoiceRepository();
    const useCase = new CreateInvoiceUseCase(repo);

    const meRecipient = convert0xToMeAddress(addrA);
    const invoice = await useCase.execute({
      recipient: meRecipient,
      targetToken: "IDRC",
      targetAmount: "16000000", // 160,000.00 IDRC
      expiryType: "NO_LIMIT",
    });

    expect(invoice.recipientAddress).toBe(addrA);
    expect(invoice.recipientMeAddress).toBe(meRecipient);
    expect(invoice.targetToken).toBe(CONTRACT_ADDRESSES.IDRC);
    expect(invoice.expiryType).toBe("NO_LIMIT");
    expect(invoice.expiresAt).toBeNull();
    expect(invoice.status).toBe("PENDING");
  });

  it("creates a FIXED invoice with valid future expiry and 10000 bps splits", async () => {
    const repo = new InMemoryInvoiceRepository();
    const useCase = new CreateInvoiceUseCase(repo);

    const invoice = await useCase.execute({
      recipient: addrA,
      targetToken: "mUSDT",
      targetAmount: "10000000",
      expiryType: "FIXED",
      expirySeconds: 600,
      splits: [
        { recipient: addrA, bps: 7000 },
        { recipient: convert0xToMeAddress(addrB), bps: 3000 },
      ],
    });

    expect(invoice.expiryType).toBe("FIXED");
    expect(invoice.expiresAt).not.toBeNull();
    expect(invoice.splits).toHaveLength(2);
    expect(invoice.splits[1].recipient).toBe(addrB);
  });

  it("rejects FIXED invoice without expiry and rejects splits not summing to 10000", async () => {
    const repo = new InMemoryInvoiceRepository();
    const useCase = new CreateInvoiceUseCase(repo);

    await expect(
      useCase.execute({
        recipient: addrA,
        targetToken: "mUSDT",
        targetAmount: "1000000",
        expiryType: "FIXED",
      })
    ).rejects.toBeInstanceOf(ValidationError);

    await expect(
      useCase.execute({
        recipient: addrA,
        targetToken: "mUSDT",
        targetAmount: "1000000",
        expiryType: "NO_LIMIT",
        splits: [
          { recipient: addrA, bps: 5000 },
          { recipient: addrB, bps: 4000 },
        ],
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
