<template>
  <kbd
    class="flex items-center justify-center rounded-sm border border-gray-400 bg-gray-50 font-mono text-xs leading-none font-thin text-gray-800 shadow-xs"
    :class="computedClasses"
  >
    <Component v-if="icon" :is="icon" class="h-3 w-3" />
    <slot v-else />
  </kbd>
</template>

<script setup lang="ts">
import { FunctionalComponent, computed } from "vue";

const props = defineProps<{
  icon?: FunctionalComponent;
}>();

const computedClasses = computed(() => {
  return {
    "px-0.5": props.icon,
    "px-1 py-0.5": !props.icon,
  };
});
</script>
