<template>
  <div class="flex flex-col border-b border-gray-200">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">{{ evaluatedScore }}</span>
      <div class="flex flex-grow flex-col gap-1">
        <span class="text-sm">Stockfish 15.1</span>
        <div class="flex gap-4">
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Depth</span>
            <span>{{ depth }}</span>
          </div>
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Nodes/s</span>
            <span>{{ nodesPerSecond }}</span>
          </div>
        </div>
      </div>
      <BaseSwitch v-model="isEvaluationEnabled" />
    </div>
    <div class="flex h-1 flex-col bg-orange-100" :class="isEvaluationEnabled ? 'bg-orange-100' : 'bg-transparent'">
      <span
        v-show="isEvaluationEnabled"
        class="h-full origin-left animate-pulse bg-orange-400 transition-transform duration-200 ease-out"
        :style="`transform: scaleX(${depth / 99})`"
      ></span>
    </div>
    <div v-if="principleVariation" class="border-t text-sm text-gray-700 p-1 line-clamp-1">
      {{ principleVariation }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGame } from "@composables/useGame";
import { onUnmounted } from "vue";
import BaseSwitch from "../base/BaseSwitch.vue";
import { useEvaluation } from "@composables/useEvaluation";

const props = defineProps<{
  fen: string;
  turnColor: "white" | "black";
}>();

const { isEvaluationEnabled, depth, principleVariation, evaluatedScore, nodesPerSecond } = await useEvaluation(
  props.fen,
  props.turnColor
);

onUnmounted(() => {
  isEvaluationEnabled.value = false;
});
</script>
