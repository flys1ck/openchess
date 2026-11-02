<template>
  <p v-if="loadError" class="text-muted-foreground p-4 text-sm">{{ loadError }}</p>
  <GameMain
    v-else-if="parsedGame"
    :game="game"
    :orientation="chessDotCom.username === parsedGame[0].headers.get('White') ? 'white' : 'black'"
  />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { parsePgn, type PgnNodeData, type Game as PgnGame } from "chessops/pgn";
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute("/games/chessdotcom/[gameId]");
const chessDotCom = useChessDotCom();
const game = useGame();
const parsedGame = shallowRef<PgnGame<PgnNodeData>[]>();
const loadError = shallowRef("");
const { setBreadcrumbs } = useBreadcrumbs();

async function loadGame(gameId: string) {
  try {
    const gameInfo = await chessDotCom.client.getGameByUuid(gameId);
    // The user can navigate away while this loads, and the next page owns the breadcrumbs by then.
    if (route.params.gameId !== gameId) return;
    if (!gameInfo) throw new Error("Chess.com game not found");

    game.loadPgn(gameInfo.pgn);
    parsedGame.value = parsePgn(gameInfo.pgn);
    loadError.value = "";

    setBreadcrumbs([
      navigationItems.games,
      {
        name: "Chess.com",
        to: { name: "/games/", query: { source: "chessdotcom" } },
      },
      {
        name: `${parsedGame.value[0].headers.get("White")} vs. ${parsedGame.value[0].headers.get("Black")}`,
        to: `/games/chessdotcom/${gameId}`,
      },
    ]);
  } catch (error) {
    if (route.params.gameId !== gameId) return;

    parsedGame.value = undefined;
    loadError.value = error instanceof Error ? error.message : "Failed to load Chess.com game";
    setBreadcrumbs([
      navigationItems.games,
      { name: "Chess.com", to: { name: "/games/", query: { source: "chessdotcom" } } },
    ]);
  }
}

await loadGame(route.params.gameId as string);

watch(
  () => route.params.gameId,
  async (gameId) => await loadGame(gameId)
);
</script>
