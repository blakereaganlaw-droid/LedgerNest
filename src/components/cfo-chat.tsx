"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const SUGGESTIONS = [
  "Map my current monthly cash flow from the snapshot and flag what's missing.",
  "Rank ways to lower my risk of falling behind over the next 12 months.",
  "Compare snowball vs. avalanche for my debts using my actual numbers.",
];

export function CfoChat({ configured }: { configured: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setInput("");
    const outgoing: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    // Render the user turn plus an empty assistant turn we stream into.
    setMessages([...outgoing, { role: "assistant", content: "" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/cfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
      });

      if (!res.ok || !res.body) {
        let message = "The assistant could not respond. Please try again.";
        try {
          const data: unknown = await res.json();
          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
          ) {
            message = (data as { error: string }).error;
          }
        } catch {
          // Non-JSON error body — keep the default message.
        }
        setError(message);
        setMessages(outgoing);
        return;
      }

      // A 200 that isn't our text stream means auth redirected us to the
      // login page (session expired); don't render the HTML as a reply.
      if (!(res.headers.get("content-type") ?? "").includes("text/plain")) {
        setError("Your session may have expired. Reload the page and sign in again.");
        setMessages(outgoing);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        const snapshot = assistantText;
        setMessages([...outgoing, { role: "assistant", content: snapshot }]);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
      // Flush any bytes buffered across the final chunk boundary.
      assistantText += decoder.decode();
      setMessages([...outgoing, { role: "assistant", content: assistantText }]);

      if (assistantText.trim() === "") {
        setError("The assistant returned an empty response.");
        setMessages(outgoing);
      }
    } catch {
      setError("Network error while contacting the assistant.");
      setMessages(outgoing);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void send(input);
  }

  if (!configured) {
    return (
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm">
          <p className="font-medium">The CFO assistant is not configured yet.</p>
          <p className="text-muted-foreground">
            Set the server-only <code>ANTHROPIC_API_KEY</code> environment
            variable (never as a <code>NEXT_PUBLIC_*</code> value), then reload
            this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={scrollRef}
        className="max-h-[60vh] space-y-4 overflow-y-auto rounded-xl border border-border p-4"
        data-testid="cfo-transcript"
      >
        {messages.length === 0 ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Ask about your cash flow, debts, risks, or a specific decision.
              The assistant reads your current LedgerNest snapshot.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-md border border-border px-3 py-2 text-left hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {m.role === "user" ? "You" : "CFO"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {m.content ||
                  (busy && i === messages.length - 1 ? "Thinking…" : "")}
              </p>
            </div>
          ))
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          name="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask your Household CFO…"
          rows={3}
          maxLength={8000}
          disabled={busy}
          className="flex w-full rounded-md border border-border bg-muted px-3 py-2 text-sm disabled:opacity-50"
          data-testid="cfo-input"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Not financial, tax, or legal advice. Enter to send, Shift+Enter for a
            new line.
          </p>
          <Button type="submit" disabled={busy || input.trim() === ""}>
            {busy ? "Working…" : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
