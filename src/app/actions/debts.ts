"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

const CreateDebtSchema = z.object({
  name: z.string().min(1).max(80),
  principalCents: z.number().int().positive(),
  aprPercent: z.number().min(0).max(100),
  minimumPaymentCents: z.number().int().positive(),
  extraPaymentCents: z.number().int().nonnegative().default(0),
});

export async function createDebtAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = CreateDebtSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid debt parameters." };
  }

  const aprBps = Math.round(parsed.data.aprPercent * 100);

  await prisma.debtPlan.create({
    data: {
      userId,
      name: parsed.data.name,
      principalCents: BigInt(parsed.data.principalCents),
      aprBps,
      minimumPaymentCents: BigInt(parsed.data.minimumPaymentCents),
      extraPaymentCents: BigInt(parsed.data.extraPaymentCents),
    },
  });

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  return { success: true as const };
}
