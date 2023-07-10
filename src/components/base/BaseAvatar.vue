<template>
  <img
    class="inline-block h-10 w-10 rounded-full outline outline-2 outline-orange-400 outline-offset-2"
    :src="src"
    :alt="alt"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
}>();
</script>
