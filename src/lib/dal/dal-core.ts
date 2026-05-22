import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type SessionInfo = {
  isAuth: true;
  userId: string;
  userEmail: string;
  userName: string;
};

export const verifySession = cache(async (): Promise<SessionInfo> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    isAuth: true,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  };
});

export const getOptionalSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  };
});

export async function getUserCount(): Promise<number> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.count();
}
