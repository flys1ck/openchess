<template>
  <div class="mt-4 mb-4 border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
    <h1 class="text-2xl leading-6 font-semibold text-gray-900">{{ heading }}</h1>
    <div v-if="$slots.actions" class="mt-3 sm:mt-0 sm:ml-4">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading: string;
}>();
</script>
