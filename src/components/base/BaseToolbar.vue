<template>
  <div class="mb-4 flex items-center justify-between gap-4">
    <div>
      <slot name="start" />
    </div>
    <div class="flex items-center gap-2">
      <slot name="end" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  start?: () => unknown;
  end?: () => unknown;
}>();
</script>
