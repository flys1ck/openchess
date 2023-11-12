<template>
  <div class="grid grid-cols-3 gap-x-8 gap-y-10">
    <div>
      <h2 class="text-base font-semibold leading-7 text-gray-900">{{ heading }}</h2>
      <p v-if="$slots.description" class="mt-1 text-sm leading-6 text-gray-700">
        <slot name="description" />
      </p>
    </div>
    <div class="md:col-span-2">
      <slot name="form" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading: string;
}>();

defineSlots<{
  description?: void;
  form: void;
}>();
</script>
