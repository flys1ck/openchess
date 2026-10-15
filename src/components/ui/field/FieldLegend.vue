<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    variant?: "legend" | "label";
  }>(),
  {
    variant: "legend",
  }
);
</script>

<template>
  <legend
    data-slot="field-legend"
    :data-variant="variant"
    :class="cn('mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base', props.class)"
  >
    <slot />
  </legend>
</template>
