<template>
  <main class="flex flex-grow overflow-x-hidden">
    <div class="flex flex-grow flex-col overflow-y-auto">
      <!-- use name from settings -->
      <GameChessboard
        :game="game"
        :orientation="parsedGame.tags!['Black'] === lichess.username ? 'black' : 'white'"
        class="max-w-4xl flex-grow p-4"
      />
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router/auto";
import GameChessboard from "@components/GameChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { ParseTree, parse } from "@mliebelt/pgn-parser";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const lichessGamePgn = await lichess.client.exportGameById(route.params.gameId);

const game = useGame();
game.createNewGame();
game.tree.fromPgn(lichessGamePgn);
if (game.tree.root.value) game.setActivePosition(game.tree.root.value);

const parsedGame = parse(lichessGamePgn, { startRule: "game" }) as ParseTree;
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
    name: `${parsedGame.tags!["White"]} vs. ${parsedGame.tags!["Black"]}`,
    to: `/games/lichess/${route.params.gameId}`,
  },
]);
</script>
