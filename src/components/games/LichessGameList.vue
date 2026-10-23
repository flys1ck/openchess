<template>
  <div>
    <div v-if="isPending" class="space-y-4">
      <GameCardSkeleton v-for="index in 5" :key="index" />
    </div>
    <p v-else-if="error" class="text-muted-foreground p-4 text-sm">Couldn't load games from Lichess.</p>
    <p v-else-if="!normalizedGames.length" class="text-muted-foreground p-4 text-sm">No games on Lichess yet.</p>
    <ul class="space-y-4">
      <GameCard
        v-for="game in normalizedGames"
        :key="game.id"
        :to="`/games/lichess/${game.id}`"
        :game="game"
        :player-color="getPlayerColor(game, lichess.username)"
      />
    </ul>
    <Button v-if="hasNextPage" variant="outline" class="mt-4" :disabled="isFetchingNextPage" @click="loadMore">
      <Spinner v-if="isFetchingNextPage" data-icon="inline-start" />
      Load more
    </Button>
  </div>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import GameCardSkeleton from "@components/games/GameCardSkeleton.vue";
import { exportGamesOfAuser, type GameJson } from "@flys1ck/lichess-client";
import { useLichess } from "@stores/useLichess";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { getPlayerColor, normalizeLichessGame } from "@utilities/normalizer";
import { computed } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const LICHESS_GAMES_PAGE_SIZE = 20;

const lichess = useLichess();

async function fetchGames(until: number | undefined, signal: AbortSignal): Promise<GameJson[]> {
  const response = await exportGamesOfAuser({
    path: { username: lichess.username },
    query: {
      max: LICHESS_GAMES_PAGE_SIZE,
      opening: true,
      ...(until === undefined ? {} : { until }),
    },
    parseAs: "text",
    headers: { Accept: "application/x-ndjson" },
    signal,
  });
  if (response.error) throw new Error(`Lichess responded with ${response.response.status}`);

  return ((response.data as string) ?? "")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as GameJson);
}

const { data, error, isPending, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
  queryKey: ["lichess", "games", computed(() => lichess.username)],
  queryFn: ({ pageParam, signal }) => fetchGames(pageParam, signal),
  initialPageParam: undefined as number | undefined,
  getNextPageParam: (lastPage) => (lastPage.length >= LICHESS_GAMES_PAGE_SIZE ? lastPage.at(-1)?.createdAt : undefined),
});

defineExpose({ refresh: () => refetch() });

const normalizedGames = computed(() => {
  return (data.value?.pages.flat() ?? []).map((game) => {
    return normalizeLichessGame(game);
  });
});

async function loadMore() {
  const result = await fetchNextPage();
  if (result.isFetchNextPageError) {
    toast.error("Couldn't load more games", {
      description: "Check your connection and try again.",
    });
  }
}
</script>
