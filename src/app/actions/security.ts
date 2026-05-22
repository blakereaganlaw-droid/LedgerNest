"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { verifySession } from "@/lib/dal/dal-core";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(12),
    confirmPassword: z.string().min(12),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(rawInput: unknown) {
  const { userId } = await verifySession();
  const parsed = ChangePasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid password input." };
  }

  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: hdrs,
    });
    await logAuditEvent({
      type: "PASSWORD_CHANGE",
      userId,
      ...meta,
    });
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Current password is incorrect." };
  }
}
