import Link from "next/link";
import { getRecentAuditEventsDTO } from "@/lib/dal/audit-read";

const links = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/widgets", label: "Dashboard widgets" },
];

export default async function SettingsPage() {
  const auditEvents = await getRecentAuditEventsDTO(15);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-lg border border-border p-4 hover:bg-muted"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Recent audit events</h2>
        <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3 text-sm">
          {auditEvents.length === 0 ? (
            <li className="text-muted-foreground">No events yet.</li>
          ) : (
            auditEvents.map((e) => (
              <li key={e.id} className="border-b border-border pb-2 last:border-0">
                <span className="font-medium">{e.type}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {new Date(e.createdAt).toLocaleString("en-US")}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
