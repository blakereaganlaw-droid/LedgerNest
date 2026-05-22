"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransactionAction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountDTO } from "@/lib/dal/accounts";
import type { CategoryLeafDTO } from "@/lib/dal/categories";

export function TransactionForm({
  accounts,
  categories,
}: {
  accounts: AccountDTO[];
  categories: CategoryLeafDTO[];
}) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const type = String(fd.get("type")) as "INCOME" | "EXPENSE" | "TRANSFER";
    const res = await createTransactionAction({
      accountId: String(fd.get("accountId")),
      categoryId: String(fd.get("categoryId")),
      type,
      amountCents: Math.round(parseFloat(String(fd.get("amount"))) * 100),
      memo: String(fd.get("memo") || ""),
      date: new Date(String(fd.get("date"))).toISOString(),
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
        <Label>Account</Label>
        <select
          name="accountId"
          className="flex h-10 w-full rounded-md border border-border bg-muted px-3 text-sm"
          required
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Category (leaf)</Label>
        <select
          name="categoryId"
          className="flex h-10 w-full rounded-md border border-border bg-muted px-3 text-sm"
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <select
          name="type"
          className="flex h-10 w-full rounded-md border border-border bg-muted px-3 text-sm"
          defaultValue="EXPENSE"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Amount (USD)</Label>
        <Input name="amount" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          name="date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Memo</Label>
        <Input name="memo" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Add transaction</Button>
    </form>
  );
}
