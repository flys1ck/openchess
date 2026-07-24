<template>
  <GameMain
    v-if="parsedGame"
    :game="game"
    :orientation="lichess.username === parsedGame[0].headers.get('White') ? 'white' : 'black'"
  />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { exportOneGame } from "@flys1ck/lichess-client";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";
import { parsePgn, type PgnNodeData, type Game as PgnGame } from "chessops/pgn";
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const game = useGame();
const parsedGame = shallowRef<PgnGame<PgnNodeData>[]>();
const { setBreadcrumbs } = useBreadcrumbs();

async function loadGame(gameId: string) {
  const { data: lichessGamePgn } = (await exportOneGame({
    path: { gameId },
    headers: { Accept: "application/x-chess-pgn" },
    parseAs: "text",
  })) as { data: string };

  game.createNewGame();
  game.tree.fromPgn(lichessGamePgn);
  parsedGame.value = parsePgn(lichessGamePgn);

  setBreadcrumbs([
    {
      icon: AcademicCapIcon,
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
