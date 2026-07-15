<template>
  <GameMain :game="game" :orientation="parsedGame[0].headers.get('White') === 'flys1ck' ? 'white' : 'black'" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { parsePgn } from "chessops/pgn";
import { useRoute } from "vue-router";

const route = useRoute("/games/chessdotcom/[gameId]");
const chessDotCom = useChessDotCom();
const gameInfo = (await chessDotCom.client.getGameByUuid(route.params.gameId as string))!;

const game = useGame();
game.tree.fromPgn(gameInfo.pgn);
const parsedGame = parsePgn(gameInfo.pgn);
const { setBreadcrumbs } = useBreadcrumbs();
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
    name: `${parsedGame[0].headers.get("White")} vs. ${parsedGame[0].headers.get("Black")}`,
    to: `/games/chessdotcom/${route.params.gameId}`,
  },
]);

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
