<template>
  <SliderRoot
    v-model="modelValue"
    class="relative flex h-5 touch-none select-none items-center"
    :min="min"
    :max="max"
    :step="step"
  >
    <SliderTrack class="relative h-[3px] grow rounded bg-gray-300">
      <SliderRange class="absolute h-full rounded bg-orange-400" />
    </SliderTrack>
    <SliderThumb
      class="block h-4 w-4 rounded border-2 border-orange-400 bg-orange-200 ring ring-gray-50 focus:outline-none focus:ring-orange-300/50"
      aria-label="Volume"
    />
  </SliderRoot>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "radix-vue";

// TODO: in general not focusable via label
const modelValue = defineModel<[number]>({ default: [0] });

withDefaults(
  defineProps<{
    min?: number;
    max: number;
    step?: number;
  }>(),
  {
    min: 0,
    step: 1,
  }
);
</script>
