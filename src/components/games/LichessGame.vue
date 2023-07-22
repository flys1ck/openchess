<template>
  <main class="flex-grow overflow-y-auto overflow-x-hidden flex">
    <div class="flex-grow">
      <TheChessboard :game="game" />
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import { exportGameById } from "@services/lichess";
import { useRoute } from "vue-router/auto";
import TheChessboard from "@components/TheChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";

const route = useRoute("/games/lichess/[gameId]");
const lichessGamePgn = await exportGameById(route.params.gameId);

const game = useGame();
// if (!line.is_white) game.toggleOrientation();
// TODO: ???? why does it only work with timeout
setTimeout(() => {
  game.tree.fromPgn(lichessGamePgn);
}, 0);

// if (game.tree.root.value) game.setActivePosition(game.tree.root.value);
</script>
