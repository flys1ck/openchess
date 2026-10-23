<template>
  <span
    :class="
      difference === 0
        ? 'text-muted-foreground'
        : isPositive
          ? 'text-emerald-700 dark:text-emerald-400'
          : 'text-red-700 dark:text-red-400'
    "
  >
    {{ formattedDifference }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { difference = 0 } = defineProps<{
  difference?: number;
}>();

const isPositive = difference >= 0;
const formattedDifference = computed(() => {
  if (difference === 0) return "±0";
  return isPositive ? `+${difference}` : difference;
});
</script>
