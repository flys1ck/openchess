<template>
  <BaseCard as="li" class="relative flex gap-8">
    <div class="flex-grow p-4">
      <RouterLink :to="to">
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
      <p v-if="game.moves" class="line-clamp-3 text-xs text-gray-500">
        {{ game.moves }}
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
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from "@components/base/BaseCard.vue";
import BaseTime from "@components/base/BaseTime.vue";
import GameCardPlayer from "@components/games/GameCardPlayer.vue";
import { ClockIcon, PlayIcon } from "@heroicons/vue/24/outline";
import { ChessGame } from "@utilities/normalizer";

defineProps<{
  to: string;
  game: ChessGame;
}>();
</script>
