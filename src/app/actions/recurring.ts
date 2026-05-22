"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

const CreateRecurringSchema = z.object({
  name: z.string().min(1).max(80),
  amountCents: z.number().int().positive(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  nextDueDate: z.string().datetime(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
});

export async function createRecurringAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = CreateRecurringSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid recurring item." };
  }

  if (parsed.data.accountId) {
    const account = await prisma.financialAccount.findFirst({
      where: { id: parsed.data.accountId, userId, isArchived: false },
    });
    if (!account) {
      return { success: false as const, error: "Account not found." };
    }
  }

  await prisma.recurringItem.create({
    data: {
      userId,
      name: parsed.data.name,
      amountCents: BigInt(parsed.data.amountCents),
      frequency: parsed.data.frequency,
      nextDueDate: new Date(parsed.data.nextDueDate),
      categoryId: parsed.data.categoryId ?? null,
      accountId: parsed.data.accountId ?? null,
    },
  });

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  return { success: true as const };
}
