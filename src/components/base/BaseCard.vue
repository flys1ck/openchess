<template>
  <Component :is="as" class="rounded-lg shadow bg-white focus-within:ring hover:bg-orange-50">
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
