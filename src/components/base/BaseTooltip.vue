<template>
  <span ref="triggerRef" class="relative">
    <span class="underline decoration-gray-400 decoration-dashed">
      <slot name="trigger" />
    </span>
    <Teleport to="body">
      <span
        v-show="isTriggerHovered"
        ref="tooltipRef"
        class="absolute z-10 max-w-xs rounded bg-gray-900 px-2 py-1 text-xs text-gray-50 shadow-lg"
      >
        <slot />
        <span ref="arrowRef" class="absolute h-2 w-2 rotate-45 bg-gray-900" />
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { Side, arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { useElementHover } from "@vueuse/core";
import { ref, watch } from "vue";

const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const isTriggerHovered = useElementHover(triggerRef);

const computeTooltipPosition = () => {
  if (!triggerRef.value || !tooltipRef.value || !arrowRef.value) return;

  const OFFSET = 5;
  const offsetWidth = Math.sqrt(2 * arrowRef.value.offsetWidth ** 2) / 2 + OFFSET;

  computePosition(triggerRef.value, tooltipRef.value, {
    placement: "top",
    middleware: [offset(offsetWidth), flip(), shift(), arrow({ element: arrowRef.value })],
  }).then(({ placement, x, y, middlewareData }) => {
    if (!tooltipRef.value) return;
    Object.assign(tooltipRef.value.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (!arrowRef.value || !middlewareData.arrow) return;
    const side = placement.split("-")[0] as Side;
    const staticSideMapping: Record<Side, Side> = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    };
    const staticSide: Side = staticSideMapping[side];
    const { x: arrowX, y: arrowY } = middlewareData.arrow;

    Object.assign(arrowRef.value.style, {
      left: arrowX != null ? `${arrowX}px` : "",
      top: arrowY != null ? `${arrowY}px` : "",
      right: "",
      bottom: "",
      [staticSide]: `-${arrowRef.value.offsetWidth / 2}px`,
    });
  });
};

watch(isTriggerHovered, () => {
  if (isTriggerHovered.value === true) computeTooltipPosition();
});
</script>
