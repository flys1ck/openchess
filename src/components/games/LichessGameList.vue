<template>
  <ul class="space-y-4">
    <GameCard
      v-for="game in computedGames"
      :key="game.id"
      :to="`/games/lichess/${game.id}`"
      :game="game"
      class="relative flex gap-8"
    >
      <div class="flex-grow p-4">
        <RouterLink :to="`/games/lichess/${game.id}`">
          <div class="flex items-center gap-2">
            <GameCardPlayer :player="game.players.white" class="flex flex-1 flex-col items-end" />
            <span class="text-3xl font-thin tracking-tighter text-gray-300">VS</span>
            <GameCardPlayer :player="game.players.black" class="flex flex-1 flex-col" />
          </div>
          <span class="absolute inset-0" aria-hidden="true" />
        </RouterLink>
        <div class="mt-2 text-xs font-medium text-gray-800">
          <template v-if="game.opening">{{ game.opening.name }}</template>
          <template v-else-if="game.variant === 'fromPosition'">From position: {{ game.initialFen }}</template>
        </div>
        <p class="line-clamp-3 text-xs text-gray-500">
          {{ getMoveStringFromSan(game.moves?.split(" ") ?? [], game.initialFen) }}
        </p>
      </div>
      <div class="flex items-center border-l p-4">
        <dl class="w-40 space-y-1 text-sm">
          <div v-if="game.clock" class="flex items-center gap-2">
            <dt>
              <span class="sr-only">Time control</span>
              <PlayIcon class="h-4 w-4 text-gray-400" />
            </dt>
            <dd class="text-gray-800">{{ game.clock.initial / 60 }}+{{ game.clock.increment }}</dd>
          </div>
          <div class="flex items-center gap-2">
            <dt>
              <span class="sr-only">Played at</span>
              <ClockIcon class="h-4 w-4 text-gray-400" />
            </dt>
            <dd class="text-gray-800">
              <BaseTime :date="new Date(game.createdAt)" />
            </dd>
          </div>
        </dl>
      </div>
    </GameCard>
  </ul>
</template>

<script setup lang="ts">
import { ClockIcon, PlayIcon } from "@heroicons/vue/24/outline";
import { LichessGame } from "@services/lichess";
import BaseTime from "@components/base/BaseTime.vue";
import { computed, shallowRef } from "vue";
import { useLichess } from "@stores/useLichess";
import GameCardPlayer from "@components/games/GameCardPlayer.vue";
import { getMoveStringFromSan } from "@utilities/moves";
import GameCard from "@/components/games/GameCard.vue";
import { normalizeLichessGame } from "@/utilities/proxies";

defineExpose({ refresh });

const lichess = useLichess();
const games = shallowRef<LichessGame[]>(
  await lichess.client.exportGamesByUser(
    lichess.username,
    { max: 5, opening: true },
    { accept: "application/x-ndjson" }
  )
);

const computedGames = computed(() => {
  return games.value.map((game) => {
    return normalizeLichessGame(game);
  });
});

async function refresh() {
  games.value = await lichess.client.exportGamesByUser(
    lichess.username,
    { max: 5, opening: true },
    { accept: "application/x-ndjson" }
  );
}
</script>
