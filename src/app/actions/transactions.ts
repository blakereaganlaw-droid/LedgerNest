"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  type: z.nativeEnum(TransactionType),
  amountCents: z.number().int().positive(),
  memo: z.string().max(200).optional(),
  date: z.string().datetime(),
});

export async function createTransactionAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const result = CreateTransactionSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false as const, error: "Invalid form input parameters." };
  }

  const data = result.data;
  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  const account = await prisma.financialAccount.findFirst({
    where: { id: data.accountId, userId, isArchived: false },
  });
  if (!account) {
    return { success: false as const, error: "Account not found." };
  }

  const category = await prisma.categoryNode.findFirst({
    where: { id: data.categoryId, userId, depth: 2, isArchived: false },
  });
  if (!category) {
    return { success: false as const, error: "Leaf category required." };
  }

  const amount = BigInt(data.amountCents);
  const balanceDelta =
    data.type === "EXPENSE" ? -amount : amount;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amountCents: amount,
          memo: data.memo,
          date: new Date(data.date),
        },
      });
      await tx.financialAccount.update({
        where: { id: data.accountId },
        data: { balanceCents: { increment: balanceDelta } },
      });
    });

    await logAuditEvent({
      type: "TRANSACTION_CREATE",
      userId,
      context: { accountId: data.accountId, categoryId: data.categoryId },
      ...meta,
    });
    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    return { success: true as const };
  } catch (error) {
    console.error("Failed executing Server Action:", error);
    return { success: false as const, error: "Internal server error occurred." };
  }
}
