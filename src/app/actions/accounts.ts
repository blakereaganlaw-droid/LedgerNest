"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { AccountType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const CreateAccountSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.nativeEnum(AccountType),
  openingBalanceCents: z.number().int(),
});

export async function createAccountAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const result = CreateAccountSchema.safeParse(rawInput);
  if (!result.success) {
    return { success: false as const, error: "Invalid form input parameters." };
  }

  const { name, type, openingBalanceCents } = result.data;
  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  try {
    await prisma.financialAccount.create({
      data: {
        userId,
        name,
        type,
        balanceCents: BigInt(openingBalanceCents),
        isArchived: false,
      },
    });
    await logAuditEvent({
      type: "ACCOUNT_CREATE",
      userId,
      context: { name },
      ...meta,
    });
    revalidatePath("/accounts");
    revalidatePath("/dashboard");
    return { success: true as const };
  } catch (error) {
    console.error("Failed executing Server Action:", error);
    return { success: false as const, error: "Internal server error occurred." };
  }
}

export async function archiveAccountAction(accountId: string) {
  const { userId } = await verifySession();
  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  const updated = await prisma.financialAccount.updateMany({
    where: { id: accountId, userId },
    data: { isArchived: true },
  });
  if (updated.count === 0) {
    return { success: false as const, error: "Account not found." };
  }
  await logAuditEvent({
    type: "ACCOUNT_ARCHIVE",
    userId,
    context: { accountId },
    ...meta,
  });
  revalidatePath("/accounts");
  return { success: true as const };
}
