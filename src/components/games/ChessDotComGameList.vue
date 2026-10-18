<template>
  <div>
    <div v-if="isPending" class="space-y-4">
      <StudyCardSkeleton v-for="index in 5" :key="index" />
    </div>
    <p v-else-if="error" class="text-muted-foreground p-4 text-sm">Couldn't load games from Chess.com.</p>
    <div class="space-y-6">
      <section v-for="month in months" :key="month.archive">
        <h3 class="text-muted-foreground mb-2 text-sm font-medium">{{ month.label }}</h3>
        <ul class="space-y-4">
          <GameCard v-for="game in month.games" :key="game.id" :to="`/games/chessdotcom/${game.id}`" :game="game" />
        </ul>
      </section>
    </div>
    <Button v-if="hasNextPage" variant="outline" class="mt-4" :disabled="isFetchingNextPage" @click="loadMore">
      <Spinner v-if="isFetchingNextPage" data-icon="inline-start" />
      Load more
    </Button>
  </div>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useInfiniteQuery } from "@tanstack/vue-query";
import { normalizeChessDotComGame } from "@utilities/normalizer";
import { computed } from "vue";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const chessDotCom = useChessDotCom();
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

// The archive list is fetched with the first page so a refresh also picks up a newly started month.
const { data, error, isPending, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useInfiniteQuery({
  queryKey: ["chessdotcom", "games", computed(() => chessDotCom.username)],
  queryFn: async ({ pageParam }) => {
    const archives = pageParam ?? (await chessDotCom.client.getArchivesByPlayer(chessDotCom.username));
    const [archive, ...olderArchives] = archives;
    if (!archive) return { archive: "", games: [], olderArchives };

    return { archive, games: await chessDotCom.client.getGamesByArchive(archive), olderArchives };
  },
  initialPageParam: undefined as string[] | undefined,
  getNextPageParam: (lastPage) => (lastPage.olderArchives.length > 0 ? lastPage.olderArchives : undefined),
});

defineExpose({ refresh: () => refetch() });

const months = computed(() => {
  return (data.value?.pages ?? [])
    .filter((page) => page.games.length > 0)
    .map((page) => {
      const [, year, month] = page.archive.match(/\/games\/(\d{4})\/(\d{2})$/) ?? [];
      return {
        archive: page.archive,
        label: monthFormat.format(new Date(Number(year), Number(month) - 1)),
        games: page.games.map((game) => normalizeChessDotComGame(game)),
      };
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
