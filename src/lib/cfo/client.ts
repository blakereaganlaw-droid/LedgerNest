import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client for the Household CFO assistant.
 *
 * The API key lives in `ANTHROPIC_API_KEY` (a plain server env var — never a
 * `NEXT_PUBLIC_*` value, per project policy). Returns null when unconfigured so
 * callers can degrade gracefully instead of throwing.
 */

let client: Anthropic | null = null;

export function isCfoConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getCfoClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey });
  return client;
}

/** Model and reasoning settings for the assistant. */
export const CFO_MODEL = "claude-opus-4-8";
export const CFO_MAX_TOKENS = 16000;
