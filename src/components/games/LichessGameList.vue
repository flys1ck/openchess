<template>
  <div>
    <ul class="space-y-4">
      <GameCard v-for="game in normalizedGames" :key="game.id" :to="`/games/lichess/${game.id}`" :game="game" />
    </ul>
    <Button v-if="hasMore" variant="outline" class="mt-4" :disabled="isLoadingMore" @click="loadMore">
      <Spinner v-if="isLoadingMore" data-icon="inline-start" />
      Load more
    </Button>
  </div>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import { exportGamesOfAuser, type GameJson } from "@flys1ck/lichess-client";
import { useLichess } from "@stores/useLichess";
import { parseLichessGamesNdjson } from "@utilities/lichessGames";
import { normalizeLichessGame } from "@utilities/normalizer";
import { computed, ref, shallowRef } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

defineExpose({ refresh });

const LICHESS_GAMES_PAGE_SIZE = 20;

const lichess = useLichess();

async function fetchGames(until?: number): Promise<GameJson[]> {
  const response = await exportGamesOfAuser({
    path: { username: lichess.username },
    query: {
      max: LICHESS_GAMES_PAGE_SIZE,
      opening: true,
      ...(until === undefined ? {} : { until }),
    },
    parseAs: "text",
    headers: { Accept: "application/x-ndjson" },
  });
  if (response.error) throw new Error(`Lichess responded with ${response.response.status}`);

  return parseLichessGamesNdjson((response.data as string) ?? "");
}

const games = shallowRef<GameJson[]>(await fetchGames());
const hasMore = ref(games.value.length >= LICHESS_GAMES_PAGE_SIZE);
const isLoadingMore = ref(false);

const normalizedGames = computed(() => {
  return games.value.map((game) => {
    return normalizeLichessGame(game);
  });
});

async function refresh() {
  const fetched = await fetchGames();
  games.value = fetched;
  hasMore.value = fetched.length >= LICHESS_GAMES_PAGE_SIZE;
}

async function loadMore() {
  const lastGame = games.value.at(-1);
  if (!lastGame) return;

  isLoadingMore.value = true;
  try {
    const fetched = await fetchGames(lastGame.createdAt);
    games.value = [...games.value, ...fetched];
    hasMore.value = fetched.length >= LICHESS_GAMES_PAGE_SIZE;
  } catch {
    toast.error("Couldn't load more games", {
      description: "Check your connection and try again.",
    });
  } finally {
    isLoadingMore.value = false;
  }
}
</script>
