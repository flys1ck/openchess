<template>
  <li>
    <Card class="hover:bg-muted/50 relative flex-row gap-8 py-0 transition-colors">
      <div class="grow p-4">
        <RouterLink :to="to">
          <div class="flex items-center gap-2">
            <GameCardPlayer :player="game.players.white" class="flex flex-1 flex-col items-end" />
            <span class="text-muted-foreground/50 text-3xl font-thin tracking-tighter">VS</span>
            <GameCardPlayer :player="game.players.black" class="flex flex-1 flex-col" />
          </div>
          <span class="absolute inset-0" aria-hidden="true" />
        </RouterLink>
        <div class="mt-2 text-xs font-medium">
          <template v-if="game.opening">{{ game.opening.name }}</template>
          <template v-else-if="game.variant === 'fromPosition'">From position: {{ game.initialFen }}</template>
        </div>
        <p v-if="game.moves" class="text-muted-foreground line-clamp-3 text-xs">
          {{ game.moves }}
        </p>
      </div>
      <div class="flex items-center border-l p-4">
        <dl class="w-40 space-y-1 text-sm">
          <div v-if="game.clock" class="flex items-center gap-2">
            <dt>
              <span class="sr-only">Time control</span>
              <Play class="text-muted-foreground size-4" />
            </dt>
            <dd>{{ game.clock.initial / 60 }}+{{ game.clock.increment }}</dd>
          </div>
          <div class="flex items-center gap-2">
            <dt>
              <span class="sr-only">Played at</span>
              <Clock class="text-muted-foreground size-4" />
            </dt>
            <dd>
              <BaseTime :date="new Date(game.createdAt)" />
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  </li>
</template>

<script setup lang="ts">
import BaseTime from "@components/base/BaseTime.vue";
import GameCardPlayer from "@components/games/GameCardPlayer.vue";
import { Clock, Play } from "@lucide/vue";
import { ChessGame } from "@utilities/normalizer";
import { Card } from "@/components/ui/card";

defineProps<{
  to: string;
  game: ChessGame;
}>();
</script>
