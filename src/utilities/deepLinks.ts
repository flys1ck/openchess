import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import type { Router } from "vue-router";

/**
 * Maps an OpenChess deep link to an in-app route.
 *
 * @example
 *   - `com.openchess.dev://games/lichess?id=9SZSSje9` → `/games/lichess/9SZSSje9`
 *   - `com.openchess.dev://games/chessdotcom?id=171614746182` → `/games/chessdotcom/171614746182`
 */
export function parseAppDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "games") return null;

    const provider = parsed.pathname.split("/").filter(Boolean)[0];
    const id = parsed.searchParams.get("id");
    if (!id || !["lichess", "chessdotcom"].includes(provider)) return null;

    return `/games/${provider}/${id}`;
  } catch {
    return null;
  }
}

export async function initDeepLinks(router: Router): Promise<void> {
  const navigate = async (urls: string[]) => {
    const path = parseAppDeepLink(urls[0]);
    if (path) await router.push(path);
  };

  const urls = await getCurrent();
  if (urls?.length) await navigate(urls);

  await onOpenUrl(navigate);
}
