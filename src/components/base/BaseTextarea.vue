<template>
  <textarea
    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-orange-600 focus:ring-inset sm:text-sm sm:leading-6"
    v-model="modelValue"
  ></textarea>
</template>

<script setup lang="ts">
const modelValue = defineModel<string>();
</script>
