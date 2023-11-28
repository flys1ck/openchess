<template>
  <GameMain :game="game" :orientation="lichess.username === parsedGame[0].headers.get('White') ? 'white' : 'black'" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";
import { parsePgn } from "chessops/pgn";
import { definePage, useRoute } from "vue-router/auto";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const lichessGamePgn = await lichess.client.exportGameById(route.params.gameId);

const game = useGame();
game.createNewGame();
game.tree.fromPgn(lichessGamePgn);

const parsedGame = parsePgn(lichessGamePgn);

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
const { setBreadcrumbs } = useBreadcrumbs();
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
    name: `${parsedGame[0].headers.get("White")} vs. ${parsedGame[0].headers.get("Black")}`,
    to: `/games/lichess/${route.params.gameId}`,
  },
]);
</script>
