<template>
  <div class="flex items-center">
    <input
      v-model="model"
      :id="id"
      aria-describedby="comments-description"
      name="comments"
      type="checkbox"
      class="h-4 w-4 rounded border-gray-300 text-orange-400 shadow-sm focus:ring-orange-500/50"
    />
    <label :for="id" class="ml-2 text-sm font-medium text-gray-700">{{ label }}</label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  name: string;
}>();

const id = `checkbox-${crypto.randomUUID()}`;
const model = defineModel();
</script>
