<template>
  <div class="ring-foreground/10 flex justify-between gap-8 rounded-xl p-4 ring-1">
    <div class="flex flex-col gap-4">
      <Skeleton class="h-6 w-80" />
      <Skeleton class="h-6 w-56" />
    </div>
    <div class="flex items-center">
      <Skeleton class="h-6 w-36" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton";
</script>
