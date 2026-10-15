<template>
  <div class="bg-muted relative py-2 text-center">
    <Separator class="absolute inset-x-2 top-1/2 data-[orientation=horizontal]:w-auto" />
    <span class="text-muted-foreground relative bg-inherit px-2 text-xs font-light tracking-wider uppercase">
      {{ heading }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Separator } from "@/components/ui/separator";

defineProps<{
  heading: string;
}>();
</script>
