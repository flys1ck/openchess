<template>
  <ul class="space-y-4">
    <GameCard v-for="game in computedGames" :key="game.id" :to="`/games/chessdotcom/${game.id}`" :game="game" />
  </ul>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useChessDotCom } from "@/stores/useChessDotCom";
import { ChessDotComGame } from "@/services/chessdotcom";
import GameCard from "@/components/games/GameCard.vue";
import { ChessGame } from "@/types/ChessGame";
import { parsePgn } from "chessops/pgn";
import { getMoveStringFromSan } from "@/utilities/moves";

defineExpose({ refresh });

const chessDotCom = useChessDotCom();
const games = ref<ChessDotComGame[]>(await chessDotCom.client.getRecentGamesByUser("flys1ck"));
const computedGames = computed<ChessGame[]>(() => {
  const games_ = games.value.map((game) => {
    const timeControl = game.time_control.split("+");
    const game_ = parsePgn(game.pgn)[0];
    let moves: string[] = [];
    for (const node of game_.moves.mainline()) {
      moves.push(node.san);
    }

    return {
      id: game.uuid,
      players: {
        white: {
          user: { id: game.white.uuid, name: game.white.username },
          rating: game.white.rating,
        },
        black: {
          user: { id: game.black.uuid, name: game.black.username },
          rating: game.black.rating,
        },
      },
      opening: {
        name: game_.headers.get("ECOUrl")?.split("/").pop() ?? "",
      },
      variant: game.time_class,
      initialFen: game.initial_setup,
      moves: getMoveStringFromSan(moves, game.initial_setup),
      clock: {
        initial: timeControl[0],
        increment: timeControl[1],
      },
      createdAt: game.end_time * 1000,
    };
  });
  return games_;
});

async function refresh() {
  games.value = await chessDotCom.client.getRecentGamesByUser("flys1ck");
}
</script>
