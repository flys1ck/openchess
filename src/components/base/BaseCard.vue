<template>
  <Component :is="as" class="rounded-lg bg-white shadow hover:bg-orange-50 focus-visible:ring">
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
