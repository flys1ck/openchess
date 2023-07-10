<template>
  <Component :is="as" class="border p-4 rounded">
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
