<template>
  <div>
    <span class="font-medium">{{ player.name }}</span>
    <span v.if="player.rating" class="text-sm text-gray-600" aria-hidden="true">
      {{ player.rating }}
      <RatingDifference v-if="player.ratingDiff" :difference="player.ratingDiff" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ChessGame } from "@/utilities/normalizer";
import RatingDifference from "@components/games/RatingDifference.vue";

defineProps<{
  player: ChessGame["players"]["white"] | ChessGame["players"]["black"];
}>();
</script>
