import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { seedCategoriesForUser } from "../../prisma/seed-categories";

export const databaseHooks = {
  user: {
    create: {
      before: async () => {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Registration is permanently closed. LedgerNest is locked to the household owner.",
          });
        }
      },
      after: async (user: { id: string; email: string }) => {
        await prisma.profileSettings.create({
          data: { userId: user.id },
        });
        await seedCategoriesForUser(prisma, user.id);
        await logAuditEvent({
          type: "ACCOUNT_CREATE",
          userId: user.id,
          actorEmail: user.email,
          context: { source: "owner_setup" },
        });
      },
    },
  },
  session: {
    create: {
      after: async (session: { userId: string; ipAddress?: string | null; userAgent?: string | null }) => {
        await logAuditEvent({
          type: "USER_LOGIN_SUCCESS",
          userId: session.userId,
          ipAddress: session.ipAddress ?? undefined,
          userAgent: session.userAgent ?? undefined,
        });
      },
    },
  },
};
