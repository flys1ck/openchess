<template>
  <div v-if="'aiLevel' in player">
    <span class="font-medium">Stockfish</span>
    <span class="text-gray-600 text-sm" aria-hidden="true">Level {{ player.aiLevel }}</span>
  </div>
  <div v-else>
    <span class="font-medium">{{ player.user.name }}</span>
    <span class="text-gray-600 text-sm" aria-hidden="true">
      {{ player.rating }}
      <RatingDifference :difference="player.ratingDiff" />
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
