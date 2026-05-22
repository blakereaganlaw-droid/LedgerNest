import { getAccountsDTO } from "@/lib/dal/accounts";
import { AccountForm } from "@/components/account-form";
import { formatUsdFromCents } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AccountsPage() {
  const accounts = await getAccountsDTO();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Accounts</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <AccountForm />
        <div className="space-y-3">
          {accounts.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{a.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{a.type}</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatUsdFromCents(a.balanceCents)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
