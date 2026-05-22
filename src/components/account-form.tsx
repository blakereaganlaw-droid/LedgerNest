"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccountAction } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await createAccountAction({
      name: String(fd.get("name")),
      type: String(fd.get("type")),
      openingBalanceCents: Math.round(
        parseFloat(String(fd.get("openingBalance"))) * 100,
      ),
    });
    if (!res.success) setError(res.error ?? "Failed");
    else {
      e.currentTarget.reset();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          className="flex h-10 w-full rounded-md border border-border bg-muted px-3 text-sm"
          defaultValue="CHECKING"
        >
          <option value="CHECKING">Checking</option>
          <option value="SAVINGS">Savings</option>
          <option value="CREDIT_CARD">Credit card</option>
          <option value="CASH">Cash</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="openingBalance">Opening balance (USD)</Label>
        <Input
          id="openingBalance"
          name="openingBalance"
          type="number"
          step="0.01"
          defaultValue="0"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Add account</Button>
    </form>
  );
}
