<template>
  <div class="ring-foreground/10 flex items-center gap-4 rounded-xl p-3 ring-1">
    <Skeleton class="size-28 shrink-0 rounded-sm" />
    <div class="grow space-y-2">
      <Skeleton class="h-4 w-48" />
      <Skeleton class="h-4 w-44" />
      <Skeleton class="h-3 w-64" />
      <Skeleton class="h-3 w-full max-w-md" />
    </div>
    <div class="w-40 shrink-0 space-y-2 border-l pl-4">
      <Skeleton class="h-3 w-20" />
      <Skeleton class="h-3 w-24" />
      <Skeleton class="h-3 w-16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from "@/components/ui/skeleton";
</script>
