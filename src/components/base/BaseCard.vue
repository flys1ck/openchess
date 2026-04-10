<template>
  <Component :is="as" class="rounded-lg bg-white shadow-sm hover:bg-orange-50 focus-visible:ring-3">
    <slot />
  </Component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as: string;
  }>(),
  {
    as: "div",
  }
);
</script>
