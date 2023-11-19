<template>
  <div v-if="'aiLevel' in player">
    <span class="font-medium">Stockfish</span>
    <span class="text-sm text-gray-600" aria-hidden="true">Level {{ player.aiLevel }}</span>
  </div>
  <div v-else>
    <span class="font-medium">{{ player.user.name }}</span>
    <span class="text-sm text-gray-600" aria-hidden="true">
      {{ player.rating }}
      <RatingDifference v-if="player.ratingDiff" :difference="player.ratingDiff" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { PlayerSchema } from "@schemas/lichess/ExportGameByIdSchema";
import RatingDifference from "@components/games/RatingDifference.vue";

defineProps<{
  player: z.infer<typeof PlayerSchema>;
}>();
</script>
