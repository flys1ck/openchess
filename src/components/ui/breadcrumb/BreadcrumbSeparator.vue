<script lang="ts" setup>
import { ChevronRight } from "@lucide/vue";
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    :class="cn('[&>svg]:size-3.5', props.class)"
  >
    <slot>
      <ChevronRight class="cn-rtl-flip" />
    </slot>
  </li>
</template>
