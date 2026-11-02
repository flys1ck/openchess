<template>
  <div class="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
    <div>
      <h2 class="text-base leading-7 font-semibold">{{ heading }}</h2>
      <p v-if="$slots.description" class="text-muted-foreground mt-1 text-sm leading-6">
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
  description?: () => unknown;
  form: () => unknown;
}>();
</script>
