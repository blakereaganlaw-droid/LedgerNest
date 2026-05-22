import { getAccountsDTO } from "@/lib/dal/accounts";
import { getLeafCategories } from "@/lib/dal/categories";
import { getTransactionsDTO } from "@/lib/dal/transactions";
import { TransactionForm } from "@/components/transaction-form";
import { formatUsdFromCents } from "@/lib/utils";

export default async function TransactionsPage() {
  const [accounts, categories, transactions] = await Promise.all([
    getAccountsDTO(),
    getLeafCategories(),
    getTransactionsDTO(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <TransactionForm accounts={accounts} categories={categories} />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Account</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="p-3">{t.date.slice(0, 10)}</td>
                <td className="p-3">{t.accountName}</td>
                <td className="p-3">{t.categoryName ?? "—"}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3 text-right">
                  {formatUsdFromCents(t.amountCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
