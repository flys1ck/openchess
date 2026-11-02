<template>
  <div class="flex items-center justify-between gap-4">
    <div class="min-w-0">
      <p class="text-sm font-medium">{{ name }}</p>
      <p class="text-muted-foreground flex items-center gap-1 text-sm">
        <template v-if="username">
          <BadgeCheck class="size-4 shrink-0 text-blue-500" />
          <span class="truncate">Connected as {{ username }}</span>
        </template>
        <template v-else>Not connected</template>
      </p>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { BadgeCheck } from "@lucide/vue";

defineProps<{
  name: string;
  username?: string;
}>();

defineSlots<{
  default: () => unknown;
}>();
</script>
