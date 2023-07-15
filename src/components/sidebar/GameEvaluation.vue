<template>
  <div class="flex flex-col border-b border-gray-200">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">{{ game.evaluation.evaluatedScore.value }}</span>
      <div class="flex flex-grow flex-col gap-1">
        <span class="text-sm">Stockfish 15.1</span>
        <div class="flex gap-4">
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Depth</span>
            <span>{{ game.evaluation.depth.value }}</span>
          </div>
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Nodes/s</span>
            <span>{{ game.evaluation.nodesPerSecond.value }}</span>
          </div>
        </div>
      </div>
      <BaseSwitch v-model="game.evaluation.isEvaluationEnabled.value" />
    </div>
    <div
      class="flex h-1 flex-col bg-orange-100"
      :class="game.evaluation.isEvaluationEnabled.value ? 'bg-orange-100' : 'bg-transparent'"
    >
      <span
        v-show="game.evaluation.isEvaluationEnabled.value"
        class="h-full origin-left animate-pulse bg-orange-400 transition-transform duration-200 ease-out"
        :style="`transform: scaleX(${game.evaluation.depth.value / 99})`"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from "@composables/useGame";
import BaseSwitch from "../base/BaseSwitch.vue";

defineProps<{
  game: ReturnType<typeof useGame>;
}>();
</script>
