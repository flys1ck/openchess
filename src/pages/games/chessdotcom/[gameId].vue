<template>
  <GameMain
    v-if="parsedGame"
    :game="game"
    :orientation="parsedGame[0].headers.get('White') === 'flys1ck' ? 'white' : 'black'"
  />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { parsePgn, type PgnNodeData, type Game as PgnGame } from "chessops/pgn";
import { shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute("/games/chessdotcom/[gameId]");
const chessDotCom = useChessDotCom();
const game = useGame();
const parsedGame = shallowRef<PgnGame<PgnNodeData>[]>();
const { setBreadcrumbs } = useBreadcrumbs();

async function loadGame(gameId: string) {
  const gameInfo = (await chessDotCom.client.getGameByUuid(gameId))!;

  game.createNewGame();
  game.tree.fromPgn(gameInfo.pgn);
  parsedGame.value = parsePgn(gameInfo.pgn);

  setBreadcrumbs([
    {
      icon: AcademicCapIcon,
      name: "Games",
      to: "/games/",
    },
    {
      name: "Chess.com",
      to: "/games/chessdotcom/",
    },
    {
      name: `${parsedGame.value[0].headers.get("White")} vs. ${parsedGame.value[0].headers.get("Black")}`,
      to: `/games/chessdotcom/${gameId}`,
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
