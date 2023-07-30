<template>
  <div ref="triggerRef" class="relative">
    <span class="underline decoration-dashed decoration-gray-400">
      <slot name="trigger" />
    </span>
    <Teleport to="body">
      <span
        v-show="isTriggerHovered"
        ref="tooltipRef"
        class="absolute z-10 max-w-xs rounded bg-gray-900 px-2 py-1 text-gray-50 shadow-lg text-xs"
      >
        <slot />
        <span ref="arrowRef" class="w-2 h-2 bg-gray-900 absolute rotate-45" />
      </span>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computePosition, flip, offset, shift, arrow, Side } from "@floating-ui/dom";
import { useElementHover } from "@vueuse/core";
import { ref, watch } from "vue";

const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
const isTriggerHovered = useElementHover(triggerRef);

const computeTooltipPosition = () => {
  if (!triggerRef.value || !tooltipRef.value || !arrowRef.value) return;
  const offsetWidth = Math.sqrt(2 * arrowRef.value.offsetWidth ** 2) / 2;

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

    console.log(arrowX, arrowY);

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
