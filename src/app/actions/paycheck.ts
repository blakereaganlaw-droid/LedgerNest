"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

const CreatePaycheckSchema = z.object({
  name: z.string().min(1).max(80),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "SEMIMONTHLY", "MONTHLY"]),
  anchorDate: z.string().datetime(),
  amountCents: z.number().int().nonnegative().optional(),
});

export async function createPaycheckScheduleAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = CreatePaycheckSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid paycheck schedule." };
  }

  await prisma.paycheckSchedule.create({
    data: {
      userId,
      name: parsed.data.name,
      frequency: parsed.data.frequency,
      anchorDate: new Date(parsed.data.anchorDate),
      amountCents:
        parsed.data.amountCents !== undefined
          ? BigInt(parsed.data.amountCents)
          : null,
      isActive: true,
    },
  });

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  return { success: true as const };
}
