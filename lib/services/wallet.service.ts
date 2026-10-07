import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Agent coin wallet. 1 coin = ₹1.
 *
 * Every balance change goes through `moveCoins` so the ledger can never drift from
 * the denormalised balance: both are written in the same transaction, and a debit
 * re-reads the balance inside the transaction so two concurrent spends can't
 * overdraw the same coins.
 */

export class InsufficientCoinsError extends Error {
  constructor(public needed: number, public available: number) {
    super(`Not enough coins: need ${needed}, wallet has ${available}.`);
    this.name = "InsufficientCoinsError";
  }
}

export interface MoveCoinsParams {
  customerId: string;
  delta: number; // + credit, - debit
  reason: "purchase" | "application_payment" | "admin_credit" | "admin_debit" | "refund";
  applicationId?: string;
  coinPurchaseId?: string;
  note?: string;
  createdById?: string;
}

/** Applies a coin movement atomically. Pass `tx` to join a surrounding transaction. */
export async function moveCoins(params: MoveCoinsParams, tx?: Prisma.TransactionClient) {
  const run = async (db: Prisma.TransactionClient) => {
    const customer = await db.customer.findUniqueOrThrow({
      where: { id: params.customerId },
      select: { coinBalance: true, isAgent: true },
    });
    if (!customer.isAgent) throw new Error("Coin wallets are only available to agent accounts.");

    const balanceAfter = customer.coinBalance + params.delta;
    if (balanceAfter < 0) throw new InsufficientCoinsError(-params.delta, customer.coinBalance);

    await db.customer.update({
      where: { id: params.customerId },
      data: { coinBalance: balanceAfter },
    });
    await db.coinLedger.create({
      data: {
        customerId: params.customerId,
        delta: params.delta,
        balanceAfter,
        reason: params.reason,
        applicationId: params.applicationId,
        coinPurchaseId: params.coinPurchaseId,
        note: params.note,
        createdById: params.createdById,
      },
    });
    return balanceAfter;
  };

  return tx ? run(tx) : prisma.$transaction(run);
}

/** Coins needed for an amount in paise. Rounds up — never undercharge. */
export function coinsForPaise(amountPaise: number) {
  return Math.ceil(amountPaise / 100);
}

export async function getWallet(customerId: string) {
  const [customer, ledger] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      select: { isAgent: true, agencyName: true, coinBalance: true },
    }),
    prisma.coinLedger.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  return { customer, ledger };
}
