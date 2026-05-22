export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { SetupForm } from "@/components/auth-form";
import { getUserCount } from "@/lib/dal/dal-core";

export default async function SetupPage() {
  const count = await getUserCount();
  if (count > 0) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SetupForm />
    </div>
  );
}
