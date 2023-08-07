<template>
  <span :class="difference === 0 ? 'text-gray-400' : isPositive ? 'text-blue-700' : 'text-red-700'">
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
