import "server-only";

import type { AuditEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal/dal-core";

export type AuditEventDTO = {
  id: string;
  type: AuditEventType;
  actorEmail: string | null;
  ipAddress: string | null;
  createdAt: string;
  context: Record<string, string | number | boolean | null> | null;
};

export const getRecentAuditEventsDTO = async (
  limit = 50,
): Promise<AuditEventDTO[]> => {
  const { userId } = await verifySession();

  const events = await prisma.auditEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      actorEmail: true,
      ipAddress: true,
      createdAt: true,
      contextJson: true,
    },
  });

  return events.map((e) => ({
    id: e.id,
    type: e.type,
    actorEmail: e.actorEmail,
    ipAddress: e.ipAddress,
    createdAt: e.createdAt.toISOString(),
    context: e.contextJson
      ? (JSON.parse(e.contextJson) as Record<
          string,
          string | number | boolean | null
        >)
      : null,
  }));
};
