<template>
  <label :for="htmlFor" class="block text-sm font-medium text-gray-700">
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  htmlFor: string;
}>();
</script>
