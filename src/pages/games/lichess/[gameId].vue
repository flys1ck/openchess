<template>
  <p v-if="loadError" class="text-muted-foreground p-4 text-sm">{{ loadError }}</p>
  <GameMain
    v-else-if="parsedGame"
    :game="game"
    :orientation="lichess.username === parsedGame[0].headers.get('White') ? 'white' : 'black'"
  />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { exportOneGame } from "@flys1ck/lichess-client";
import { GraduationCap } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { parsePgn, type PgnNodeData, type Game as PgnGame } from "chessops/pgn";
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const game = useGame();
const parsedGame = shallowRef<PgnGame<PgnNodeData>[]>();
const loadError = shallowRef("");
const { setBreadcrumbs } = useBreadcrumbs();

async function fetchLichessGamePgn(gameId: string) {
  const { data, error, response } = await exportOneGame({
    path: { gameId },
    headers: { Accept: "application/x-chess-pgn" },
    parseAs: "text",
    security: [{ scheme: "bearer", type: "http" }],
    fetch: tauriFetch,
  });

  if (typeof data === "string" && data.includes("[Event")) {
    return data;
  }

  throw new Error(typeof error === "string" ? error : `Failed to load Lichess game (${response?.status ?? "unknown"})`);
}

async function loadGame(gameId: string) {
  try {
    const lichessGamePgn = await fetchLichessGamePgn(gameId);

    game.createNewGame();
    game.tree.fromPgn(lichessGamePgn);
    parsedGame.value = parsePgn(lichessGamePgn);
    loadError.value = "";

    setBreadcrumbs([
      {
        icon: GraduationCap,
        name: "Games",
        to: "/games/",
      },
      {
        name: "Lichess",
        to: "/games/lichess/",
      },
      {
        name: `${parsedGame.value[0].headers.get("White")} vs. ${parsedGame.value[0].headers.get("Black")}`,
        to: `/games/lichess/${gameId}`,
      },
    ]);
  } catch (error) {
    parsedGame.value = undefined;
    loadError.value = error instanceof Error ? error.message : "Failed to load Lichess game";
  }
}

await loadGame(route.params.gameId as string);

watch(
  () => route.params.gameId,
  async (gameId) => await loadGame(gameId)
);

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
