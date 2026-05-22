import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth-hashing";
import { authConfig } from "@/lib/auth-config";
import { databaseHooks } from "@/lib/auth-hooks";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authConfig.baseURL,
  trustedOrigins: authConfig.trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  databaseHooks,
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: async ({ hash: hashVal, password }) =>
        verifyPassword(hashVal, password),
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Session = typeof auth.$Infer.Session;
