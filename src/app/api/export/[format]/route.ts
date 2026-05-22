import { NextResponse } from "next/server";
import {
  exportJsonBackupAction,
  exportTransactionsCsvAction,
} from "@/app/actions/export";

export async function GET(
  _request: Request,
  context: { params: Promise<{ format: string }> },
) {
  const { format } = await context.params;

  if (format === "json") {
    const res = await exportJsonBackupAction();
    if (!res.success || !res.data) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return new NextResponse(res.data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="ledgernest-backup.json"',
      },
    });
  }

  if (format === "csv") {
    const res = await exportTransactionsCsvAction();
    if (!res.success || !res.data) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }
    return new NextResponse(res.data, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="transactions.csv"',
      },
    });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 404 });
}
