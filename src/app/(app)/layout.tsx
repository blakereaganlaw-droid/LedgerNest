export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { verifySession } from "@/lib/dal/dal-core";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  return <AppShell userName={session.userName}>{children}</AppShell>;
}
