<template>
  <div class="relative bg-gray-50 py-2 text-center">
    <span class="absolute inset-x-2 top-1/2 border-t border-gray-200" aria-hidden="true" />
    <span class="relative bg-inherit px-2 text-xs font-light tracking-wider text-gray-500 uppercase">
      {{ heading }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading: string;
}>();
</script>
