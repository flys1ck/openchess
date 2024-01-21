<template>
  <TooltipProvider v-bind="forward" :delay-duration="200">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side-offset="5"
          class="TooltipContent select-none rounded bg-gray-800 px-2 py-0.5 text-sm font-light text-gray-50"
        >
          <slot />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipRootEmits,
  TooltipRootProps,
  TooltipTrigger,
  useForwardPropsEmits,
} from "radix-vue";

const props = defineProps<TooltipRootProps>();
const emits = defineEmits<TooltipRootEmits>();

const forward = useForwardPropsEmits(props, emits);
</script>

<style>
.TooltipContent {
  transform-origin: var(--radix-tooltip-content-transform-origin);
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0.5;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
