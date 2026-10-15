<template>
  <Badge variant="outline" class="rounded-sm font-normal" :class="resultTagClasses">{{ resultText }}</Badge>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";

const props = defineProps<{
  result: "white" | "black" | null;
}>();

const resultText = computed(() => {
  switch (props.result) {
    case "white":
      return "1 - 0";
    case "black":
      return "0 - 1";
    case null:
      return "½ - ½";
    default:
      return "-";
  }
});

const resultTagClasses = computed(() => ({
  "bg-white text-neutral-950": props.result === "white",
  "bg-neutral-300 text-neutral-800": props.result === null,
  "bg-neutral-800 text-neutral-50": props.result === "black",
}));
</script>
