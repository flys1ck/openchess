<template>
  <div>
    <slot name="trigger" :set="setTrigger" />
    <div
      v-show="isTriggerHovered"
      ref="tooltipRef"
      class="absolute top-0 left-0 z-10 inline-flex max-w-xs overflow-hidden text-clip break-words rounded-lg bg-gray-900 p-2 text-gray-50 shadow-lg"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { useElementHover } from "@vueuse/core";
import { ref, watch } from "vue";

const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const isTriggerHovered = useElementHover(triggerRef);

const setTrigger = (elementRef: HTMLElement) => {
  triggerRef.value = elementRef;
};

const computeTooltipPosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;
  computePosition(triggerRef.value, tooltipRef.value, {
    placement: "top",
    middleware: [offset(4), flip(), shift()],
  }).then(({ x, y }) => {
    if (!tooltipRef.value) return;
    Object.assign(tooltipRef.value.style, {
      transform: `translate(${x}px, ${y}px)`,
    });
  });
};

watch(isTriggerHovered, () => {
  if (isTriggerHovered.value === true) computeTooltipPosition();
});
</script>
