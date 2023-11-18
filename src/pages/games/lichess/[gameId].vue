<template>
  <main class="flex flex-grow overflow-hidden">
    <div class="flex flex-grow flex-col bg-gray-100">
      <GameChessboard
        class="mx-auto my-4 aspect-square flex-grow overflow-hidden"
        :game="game"
        :orientation="parsedGame[0].headers.get('White') === lichess.username ? 'white' : 'black'"
      />
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import { useRoute, definePage } from "vue-router/auto";
import GameChessboard from "@components/GameChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";
import { parsePgn } from "chessops/pgn";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const lichessGamePgn = await lichess.client.exportGameById(route.params.gameId);

const game = useGame();
game.createNewGame();
game.tree.fromPgn(lichessGamePgn);
if (game.tree.root.value) game.setActivePosition(game.tree.root.value);

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
