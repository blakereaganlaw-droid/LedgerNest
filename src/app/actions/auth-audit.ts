"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { logAuditEvent, headersToAuditMeta } from "@/lib/audit";

const LoginFailureSchema = z.object({
  email: z.string().email(),
});

export async function logLoginFailureAction(rawInput: unknown) {
  const parsed = LoginFailureSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false as const };
  }

  const hdrs = await headers();
  const meta = headersToAuditMeta(hdrs);

  await logAuditEvent({
    type: "USER_LOGIN_FAILURE",
    actorEmail: parsed.data.email,
    context: { attemptedEmail: parsed.data.email },
    ...meta,
  });

  return { success: true as const };
}
