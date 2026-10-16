import type { GameJson } from "@flys1ck/lichess-client";

export function parseLichessGamesNdjson(text: string): GameJson[] {
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) return parsed as GameJson[];
  } catch {}

  return text
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as GameJson);
}
