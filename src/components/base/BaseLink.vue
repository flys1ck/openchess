<template>
  <Component :is="as" class="font-semibold text-orange-400 hover:text-orange-500"><slot /></Component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "button" | "a" | "RouterLink";
  }>(),
  {
    as: "RouterLink",
  }
);
</script>
