<template>
  <Badge variant="outline" class="rounded-sm" :class="outcome.classes">{{ outcome.text }}</Badge>
</template>

<script setup lang="ts">
import { GameColor, GameResult } from "@utilities/normalizer";
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  result?: GameResult;
  playerColor?: GameColor;
}>();

const SCORES: Record<GameResult, string> = { white: "1–0", black: "0–1", draw: "½–½" };

const outcome = computed(() => {
  if (!props.result) return { text: "Unfinished", classes: "text-muted-foreground" };
  if (props.result === "draw") return { text: "Draw", classes: "bg-muted text-muted-foreground border-transparent" };
  if (!props.playerColor) return { text: SCORES[props.result], classes: "" };
  if (props.result === props.playerColor) {
    return {
      text: "Win",
      classes: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    };
  }
  return { text: "Loss", classes: "border-transparent bg-red-500/15 text-red-700 dark:text-red-400" };
});
</script>
