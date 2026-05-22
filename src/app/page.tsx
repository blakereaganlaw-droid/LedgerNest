export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getUserCount } from "@/lib/dal/dal-core";

export default async function HomePage() {
  const count = await getUserCount();
  if (count === 0) redirect("/setup");
  redirect("/dashboard");
}
