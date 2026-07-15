import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import type { Router } from "vue-router";

const APP_SCHEME = "com.openchess.dev:";

/**
 * Maps an OpenChess deep link to an in-app route. Examples: - `com.openchess.dev://games/lichess?id=9SZSSje9` →
 * `/games/lichess/9SZSSje9` - `com.openchess.dev://games/chessdotcom?id=171614746182` →
 * `/games/chessdotcom/171614746182`
 */
export function parseAppDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== APP_SCHEME || parsed.hostname !== "games") {
      return null;
    }

    const provider = parsed.pathname.split("/").filter(Boolean)[0];
    const id = parsed.searchParams.get("id");
    if (!id || (provider !== "lichess" && provider !== "chessdotcom")) {
      return null;
    }

    return `/games/${provider}/${id}`;
  } catch {
    return null;
  }
}

export async function initDeepLinks(router: Router): Promise<void> {
  const navigateFromUrls = (urls: string[]) => {
    for (const url of urls) {
      const path = parseAppDeepLink(url);
      if (path) {
        void router.push(path);
        return;
      }
    }
  };

  const current = await getCurrent();
  if (current?.length) {
    navigateFromUrls(current);
  }

  await onOpenUrl(navigateFromUrls);
}
