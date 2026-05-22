import "server-only";

import type { AuditEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditContext = Record<string, string | number | boolean | null>;

export async function logAuditEvent(params: {
  type: AuditEventType;
  userId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  context?: AuditContext;
}): Promise<void> {
  const contextJson = params.context
    ? JSON.stringify(params.context)
    : null;

  try {
    await prisma.auditEvent.create({
      data: {
        type: params.type,
        userId: params.userId ?? null,
        actorEmail: params.actorEmail ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        contextJson,
      },
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

export function headersToAuditMeta(
  headers: Headers,
): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress:
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headers.get("x-real-ip") ??
      undefined,
    userAgent: headers.get("user-agent") ?? undefined,
  };
}
