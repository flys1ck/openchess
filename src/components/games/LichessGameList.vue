<template>
  <ul class="space-y-4">
    <BaseCard v-for="game in games" :key="game.id" as="li" class="gap-8 flex relative">
      <div class="p-4 flex-grow">
        <RouterLink :to="`/games/lichess/${game.id}`">
          <div class="flex gap-2 items-center">
            <LichessPlayer :player="game.players.white" class="flex flex-col items-end flex-1" />
            <span class="text-3xl font-thin text-gray-300 tracking-tighter">VS</span>
            <LichessPlayer :player="game.players.black" class="flex flex-col flex-1" />
          </div>
          <span class="absolute inset-0" aria-hidden="true" />
        </RouterLink>
        <div class="text-gray-800 text-xs font-medium mt-2">
          <template v-if="game.opening">{{ game.opening.name }}</template>
          <template v-else-if="game.variant === 'fromPosition'">From position: {{ game.initialFen }}</template>
        </div>
        <p class="text-xs text-gray-500 line-clamp-3">{{ game.moves }}</p>
      </div>
      <div class="border-l p-4 flex items-center">
        <dl class="w-40 text-sm space-y-1">
          <div v-if="game.clock" class="flex gap-2 items-center">
            <dt>
              <span class="sr-only">Time control</span>
              <PlayIcon class="w-4 h-4 text-gray-400" />
            </dt>
            <dd class="text-gray-800">{{ game.clock.initial / 60 }}+{{ game.clock.increment }}</dd>
          </div>
          <div class="flex gap-2 items-center">
            <dt>
              <span class="sr-only">Played at</span>
              <ClockIcon class="w-4 h-4 text-gray-400" />
            </dt>
            <dd class="text-gray-800"><BaseTime :date="new Date(game.createdAt)" /></dd>
          </div>
        </dl>
      </div>
    </BaseCard>
  </ul>
</template>

<script setup lang="ts">
import { ClockIcon, PlayIcon } from "@heroicons/vue/24/outline";
import { LichessGame } from "@services/lichess";
import BaseTime from "@components/base/BaseTime.vue";
import { ref } from "vue";
import BaseCard from "@components/base/BaseCard.vue";
import { useLichess } from "@stores/useLichess";
import LichessPlayer from "@components/games/LichessPlayer.vue";

const lichess = useLichess();
const games = ref<LichessGame[]>(
  await lichess.client.exportGamesByUser(
    lichess.username,
    { max: 5, opening: true },
    { accept: "application/x-ndjson" }
  )
);

async function refresh() {
  games.value = await lichess.client.exportGamesByUser(
    lichess.username,
    { max: 5, opening: true },
    { accept: "application/x-ndjson" }
  );
}

defineExpose({ refresh });
</script>
