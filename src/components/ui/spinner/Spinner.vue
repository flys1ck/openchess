<script setup lang="ts">
import { Loader2 } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <Loader2 role="status" aria-label="Loading" :class="cn('size-4 animate-spin', props.class)" />
</template>
