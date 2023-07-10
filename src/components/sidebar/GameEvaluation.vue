<template>
  <div class="flex flex-col border-b border-gray-200">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">0</span>
      <div class="flex flex-grow flex-col gap-1">
        <span class="text-sm">Stockfish 15.1</span>
        <div class="flex gap-4">
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Depth</span>
            <span>{{ analysisBoard.game.evaluation.depth }}</span>
          </div>
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Nodes/s</span>
            <span>{{ analysisBoard.game.evaluation.nodesPerSecond }}</span>
          </div>
        </div>
      </div>
      <BaseSwitch v-model="analysisBoard.game.evaluation.isEvaluationEnabled" />
    </div>
    <div
      class="flex h-1 flex-col bg-orange-100"
      :class="analysisBoard.game.evaluation.isEvaluationEnabled ? 'bg-orange-100' : 'bg-transparent'"
    >
      <span
        v-show="analysisBoard.game.evaluation.isEvaluationEnabled"
        class="h-full origin-left animate-pulse bg-orange-400 transition-transform duration-1000 ease-out"
        :style="`transform: scaleX(${analysisBoard.game.evaluation.depth / 99})`"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalysisBoard } from "@stores/useAnalysisBoard";
import BaseSwitch from "../base/BaseSwitch.vue";

const analysisBoard = useAnalysisBoard();
</script>
