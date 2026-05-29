import "server-only";

import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal/dal-core";
import { getCfoSnapshotDTO } from "@/lib/dal/cfo";
import { formatSnapshotForModel } from "@/lib/cfo/snapshot";
import { CFO_SYSTEM_PROMPT } from "@/lib/cfo/instructions";
import {
  CFO_MAX_TOKENS,
  CFO_MODEL,
  getCfoClient,
} from "@/lib/cfo/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_USER_INPUT_CHARS = 8000;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        // Assistant turns (the structured 7-section answers) are long and get
        // resent as history, so the cap must accommodate them — not just the
        // user's input, which is bounded separately in the UI.
        content: z.string().min(1).max(60000),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(request: Request) {
  // Re-check authentication inside the handler — never rely on layout guards.
  await verifySession();

  const client = getCfoClient();
  if (!client) {
    return NextResponse.json(
      { error: "The CFO assistant is not configured. Set ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request: expected a non-empty list of messages." },
      { status: 400 },
    );
  }

  const { messages } = parsed.data;
  if (messages[0].role !== "user") {
    return NextResponse.json(
      { error: "Conversation must begin with a user message." },
      { status: 400 },
    );
  }

  const newest = messages[messages.length - 1];
  if (newest.role === "user" && newest.content.length > MAX_USER_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Message is too long (max ${MAX_USER_INPUT_CHARS} characters).` },
      { status: 400 },
    );
  }

  const snapshot = await getCfoSnapshotDTO();
  const snapshotText = formatSnapshotForModel(snapshot);

  // Stable instructions get the cache breakpoint; the per-request snapshot
  // follows it as trusted, server-generated context.
  const system: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: CFO_SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: `Current LedgerNest snapshot (server-generated, trusted context):\n\n${snapshotText}`,
    },
  ];

  const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = client.messages.stream({
    model: CFO_MODEL,
    max_tokens: CFO_MAX_TOKENS,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system,
    messages: conversation,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("CFO stream error:", error);
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
