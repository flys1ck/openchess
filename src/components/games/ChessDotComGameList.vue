<template>
  <ul class="space-y-4">
    <GameCard v-for="game in normalizedGames" :key="game.id" :to="`/games/chessdotcom/${game.id}`" :game="game" />
  </ul>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import { ChessDotComGame } from "@services/chessdotcom";
import { useChessDotCom } from "@stores/useChessDotCom";
import { ChessGame, normalizeChessDotComGame } from "@utilities/normalizer";
import { computed, shallowRef } from "vue";

defineExpose({ refresh });

const chessDotCom = useChessDotCom();
const games = shallowRef<ChessDotComGame[]>(await chessDotCom.client.getRecentGamesByPlayer(chessDotCom.username));

const normalizedGames = computed<ChessGame[]>(() => {
  return games.value.map((game) => {
    return normalizeChessDotComGame(game);
  });
});

async function refresh() {
  games.value = await chessDotCom.client.getRecentGamesByPlayer(chessDotCom.username);
}
</script>
