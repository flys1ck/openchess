<script lang="ts" setup>
import { MoreHorizontal } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <span
    data-slot="breadcrumb-ellipsis"
    role="presentation"
    aria-hidden="true"
    :class="cn('flex size-5 items-center justify-center [&>svg]:size-4', props.class)"
  >
    <slot>
      <MoreHorizontal />
    </slot>
    <span class="sr-only">More</span>
  </span>
</template>
