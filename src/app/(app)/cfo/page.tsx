import { CfoChat } from "@/components/cfo-chat";
import { isCfoConfigured } from "@/lib/cfo/client";

export default function CfoPage() {
  const configured = isCfoConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Household CFO</h1>
        <p className="text-muted-foreground">
          A calm, secular financial decision lab that reasons over your current
          ledger. Nonjudgmental analysis — not financial, tax, or legal advice.
        </p>
      </div>
      <CfoChat configured={configured} />
    </div>
  );
}
