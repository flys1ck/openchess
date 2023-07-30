<template>
  <span :class="isPositive ? 'text-blue-700' : 'text-red-700'">{{ formattedDifference }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  difference: number;
}>();

const isPositive = props.difference >= 0;
const formattedDifference = computed(() => {
  return isPositive ? `+${props.difference}` : props.difference;
});
</script>
