<template>
  <div class="flex flex-col border-b border-gray-200">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">
        {{ multiPvInfo.length > 0 ? multiPvInfo[0].evaluatedScore : "-" }}
      </span>
      <div class="flex flex-grow flex-col gap-1">
        <span class="text-sm">{{ engineName }}</span>
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
    <div class="flex h-1 flex-col" :class="isEvaluationEnabled ? 'bg-orange-100' : 'bg-transparent'">
      <span
        v-show="isEvaluationEnabled"
        class="h-full origin-left bg-orange-300 transition-transform duration-500 ease-out"
        :class="{ 'animate-pulse': isEvaluating }"
        :style="`transform: scaleX(${depth / computedDepth})`"
      ></span>
    </div>
    <ul v-if="multiPvInfo.length" class="divide-y border-t">
      <li v-for="info in multiPvInfo" :key="info.id" class="line-clamp-1 p-1 text-sm text-gray-700">
        <span class="inline-block w-10 text-end font-medium">{{ info.evaluatedScore }}</span>
        <span class="ml-2">{{ getMoveString(fen, info.principleVariation) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, onUnmounted, watch } from "vue";
import BaseSwitch from "../base/BaseSwitch.vue";
import { useEvaluation } from "@composables/useEvaluation";
import { useSettings } from "@/stores/useSettings";
import { storeToRefs } from "pinia";
import { getMoveString } from "@/utilities/uci";
import { Key } from "chessground/types";

const props = defineProps<{
  fen: Ref<string>;
}>();
const emit = defineEmits<{
  (e: "update:bestmoves", move: { score: string; from: Key; to: Key }[]): void;
}>();

const { engineDepth, engineLines } = storeToRefs(useSettings());
const computedDepth = computed(() => engineDepth.value[0]);

const {
  engineName,
  isEvaluationEnabled,
  isEvaluating,
  currentDepth: depth,
  multiPvInfo,
  nodesPerSecond,
  killProcess,
} = await useEvaluation(props.fen, { depth: engineDepth, multipv: engineLines });

watch(multiPvInfo, () => {
  const bestMoves = multiPvInfo.value.map((info) => ({
    score: info.evaluatedScore,
    from: info.principleVariation[0].slice(0, 2) as Key,
    to: info.principleVariation[0].slice(2, 4) as Key,
  }));

  emit("update:bestmoves", bestMoves);
});

onUnmounted(async () => await killProcess());
</script>
