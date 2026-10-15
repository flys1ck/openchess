<template>
  <div class="flex flex-col border-b">
    <div class="flex items-center gap-2 p-2">
      <span class="flex w-16 items-center justify-center font-medium">
        {{ multiPvInfo.length > 0 ? multiPvInfo[0].evaluatedScore : "-" }}
      </span>
      <div class="flex grow flex-col gap-1">
        <span class="text-sm">{{ engineName }}</span>
        <div class="flex gap-4">
          <div class="flex flex-col text-xs">
            <span class="text-muted-foreground font-thin tracking-widest uppercase">Depth</span>
            <span>{{ depth }} / {{ computedDepth }}</span>
          </div>
          <div class="flex flex-col text-xs">
            <span class="text-muted-foreground font-thin tracking-widest uppercase">Nodes/s</span>
            <span>{{ nodesPerSecond }}</span>
          </div>
        </div>
      </div>
      <Switch v-model="isEvaluationEnabled" aria-label="Toggle engine evaluation" />
    </div>
    <div class="flex h-1 flex-col" :class="isEvaluationEnabled ? 'bg-primary/15' : 'bg-transparent'">
      <span
        v-show="isEvaluationEnabled"
        class="bg-primary/60 h-full origin-left transition-transform duration-500 ease-out"
        :class="{ 'animate-pulse': isEvaluating }"
        :style="`transform: scaleX(${depth / computedDepth})`"
      ></span>
    </div>
    <ol v-if="multiPvInfo.length" class="divide-y border-t">
      <li v-for="info in multiPvInfo" :key="info.id" class="text-muted-foreground line-clamp-1 p-1 text-sm">
        <span class="inline-block w-10 text-end font-medium">{{ info.evaluatedScore }}</span>
        <span class="ml-2">{{ getMovesStringFromUci(info.principleVariation, fen) }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { useEvaluation } from "@composables/useEvaluation";
import { useSettings } from "@stores/useSettings";
import { getMovesStringFromUci } from "@utilities/moves";
import { Key } from "chessground/types";
import { storeToRefs } from "pinia";
import { Ref, computed, onUnmounted, watch } from "vue";
import { Switch } from "@/components/ui/switch";

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
