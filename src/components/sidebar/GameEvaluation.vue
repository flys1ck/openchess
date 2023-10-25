<template>
  <div class="flex flex-col border-b border-gray-200">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">{{ evaluatedScore }}</span>
      <div class="flex flex-grow flex-col gap-1">
        <span class="text-sm">Stockfish {{ STOCKFISH_VERSION }}</span>
        <div class="flex gap-4">
          <div class="flex flex-col text-xs">
            <span class="font-thin uppercase tracking-widest text-gray-500">Depth</span>
            <span>{{ depth }} / {{ computedDepth }}</span>
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
        class="h-full origin-left bg-orange-300 transition-transform duration-500 ease-out"
        :class="{ 'animate-pulse': isEvaluating }"
        :style="`transform: scaleX(${depth / computedDepth})`"
      ></span>
    </div>
    <div v-for="pv in principleVariations" :key="pv" class="line-clamp-1 border-t p-1 text-sm text-gray-700">
      {{ pv }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onUnmounted } from "vue";
import BaseSwitch from "../base/BaseSwitch.vue";
import { useEvaluation } from "@composables/useEvaluation";
import { useSettings } from "@/stores/useSettings";
import { storeToRefs } from "pinia";

const STOCKFISH_VERSION = import.meta.env.STOCKFISH_VERSION;
const props = defineProps<{
  fen: Ref<string>;
}>();

const { engineDepth, engineLines } = storeToRefs(useSettings());
const computedDepth = computed(() => engineDepth.value[0]);

const {
  isEvaluationEnabled,
  isEvaluating,
  currentDepth: depth,
  principleVariations,
  evaluatedScore,
  nodesPerSecond,
} = await useEvaluation(props.fen, { depth: engineDepth, multipv: engineLines });

onUnmounted(() => {
  isEvaluationEnabled.value = false;
});
</script>
