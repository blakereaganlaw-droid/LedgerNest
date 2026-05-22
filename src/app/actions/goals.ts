"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

const CreateGoalSchema = z.object({
  name: z.string().min(1).max(80),
  targetCents: z.number().int().positive(),
  isRetirement: z.boolean().default(false),
});

export async function createGoalAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = CreateGoalSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid goal parameters." };
  }

  await prisma.goal.create({
    data: {
      userId,
      name: parsed.data.name,
      targetCents: BigInt(parsed.data.targetCents),
      isRetirement: parsed.data.isRetirement,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true as const };
}
