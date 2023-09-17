<template>
  <span class="rounded border px-2 py-0.5 text-xs" :class="resultTagClasses">{{ resultText }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  }
});

const resultTagClasses = computed(() => ({
  "bg-white text-gray-900": props.result === "white",
  "bg-gray-300 text-gray-800": props.result === null,
  "bg-gray-600 text-gray-50": props.result === "black",
}));
</script>
