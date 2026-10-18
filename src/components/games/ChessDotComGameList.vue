<template>
  <div>
    <div v-if="isPending" class="space-y-4">
      <StudyCardSkeleton v-for="index in 5" :key="index" />
    </div>
    <p v-else-if="error" class="text-muted-foreground p-4 text-sm">Couldn't load games from Chess.com.</p>
    <ul class="space-y-4">
      <GameCard v-for="game in normalizedGames" :key="game.id" :to="`/games/chessdotcom/${game.id}`" :game="game" />
    </ul>
  </div>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useQuery } from "@tanstack/vue-query";
import { ChessGame, normalizeChessDotComGame } from "@utilities/normalizer";
import { computed } from "vue";

const chessDotCom = useChessDotCom();
const {
  data: games,
  error,
  isPending,
  refetch,
} = useQuery({
  queryKey: ["chessdotcom", "games", computed(() => chessDotCom.username)],
  queryFn: () => chessDotCom.client.getRecentGamesByPlayer(chessDotCom.username),
});

defineExpose({ refresh: () => refetch() });

const normalizedGames = computed<ChessGame[]>(() => {
  return (games.value ?? []).map((game) => {
    return normalizeChessDotComGame(game);
  });
});
</script>
