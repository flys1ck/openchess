<template>
  <GameMain :game="game" :orientation="lichess.username === parsedGame[0].headers.get('White') ? 'white' : 'black'" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { exportOneGame } from "@flys1ck/lichess-client";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";
import { parsePgn } from "chessops/pgn";
import { useRoute } from "vue-router";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const { data: lichessGamePgn } = (await exportOneGame({
  path: { gameId: route.params.gameId },
  headers: { Accept: "application/x-chess-pgn" },
})) as { data: string };

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
