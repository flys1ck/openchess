<template>
  <ul class="space-y-4">
    <GameCard v-for="game in computedGames" :key="game.id" :to="`/games/chessdotcom/${game.id}`" :game="game" />
  </ul>
</template>

<script setup lang="ts">
import { computed, shallowRef } from "vue";
import { useChessDotCom } from "@/stores/useChessDotCom";
import { ChessDotComGame } from "@/services/chessdotcom";
import GameCard from "@/components/games/GameCard.vue";
import { ChessGame } from "@/types/ChessGame";
import { normalizeChessDotComGame } from "@/utilities/proxies";

defineExpose({ refresh });

const chessDotCom = useChessDotCom();
const games = shallowRef<ChessDotComGame[]>(await chessDotCom.client.getRecentGamesByUser("flys1ck"));
const computedGames = computed<ChessGame[]>(() => {
  return games.value.map((game) => {
    return normalizeChessDotComGame(game);
  });
});

async function refresh() {
  games.value = await chessDotCom.client.getRecentGamesByUser("flys1ck");
}
</script>
