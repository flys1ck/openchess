<template>
  <span class="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium" :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { FunctionalComponent, computed } from "vue";

const props = withDefaults(
  defineProps<{
    /**
     * Visual style of the button.
     * @values primary, secondary
     */
    variant?: "gray" | "red" | "yellow" | "green" | "blue" | "indigo" | "purple" | "pink";
    prefixIcon?: FunctionalComponent;
  }>(),
  {
    variant: "gray",
  }
);

const badgeClasses = computed(() => ({
  "border-gray-500/10 text-gray-600 bg-gray-50": props.variant === "gray",
  "border-red-600/10 text-red-700 bg-red-50": props.variant === "red",
  "border-yellow-600/10 text-yellow-800 bg-yellow-50": props.variant === "yellow",
  "border-green-600/10 text-green-700 bg-green-50": props.variant === "green",
  "border-blue-700/10 text-blue-700 bg-blue-50": props.variant === "blue",
  "border-indigo-700/10 text-indigo-700 bg-indigo-50": props.variant === "indigo",
  "border-purple-700/10 text-purple-700 bg-purple-50": props.variant === "purple",
  "border-pink-700/10 text-pink-700 bg-pink-50": props.variant === "pink",
}));
</script>
