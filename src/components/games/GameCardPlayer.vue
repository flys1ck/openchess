<template>
  <div class="flex min-w-0 items-center gap-2 text-sm">
    <span
      class="size-3 shrink-0 rounded-xs border border-neutral-400"
      :class="color === 'white' ? 'bg-white' : 'bg-neutral-900'"
      aria-hidden="true"
    />
    <span class="sr-only">{{ color === "white" ? "White" : "Black" }}:</span>
    <span class="truncate" :class="isPlayer ? 'font-semibold' : 'font-medium'">{{ player.name }}</span>
    <span v-if="player.rating" class="text-muted-foreground shrink-0 tabular-nums">
      {{ player.rating }}
      <RatingDifference v-if="player.ratingDiff" :difference="player.ratingDiff" />
    </span>
  </div>
</template>

<script setup lang="ts">
import RatingDifference from "@components/games/RatingDifference.vue";
import { ChessGame, GameColor } from "@utilities/normalizer";

defineProps<{
  player: ChessGame["players"]["white"] | ChessGame["players"]["black"];
  color: GameColor;
  isPlayer?: boolean;
}>();
</script>
