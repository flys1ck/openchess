<template>
  <Component
    :is="as"
    class="inline-flex flex-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus:outline-none focus:ring"
    :class="computedClasses"
    :type="as === 'button' && 'button'"
  >
    <Component :is="prefixIcon" class="h-4 w-4" :class="computedIconClasses" />
    <slot />
  </Component>
</template>

<script setup lang="ts">
import { computed, FunctionalComponent, useAttrs, useSlots } from "vue";

const props = withDefaults(
  defineProps<{
    /**
     * Tag or component name.
     * @values button, a, RouterLink
     */
    as?: "button" | "a" | "RouterLink";
    /**
     * Visual style of the button.
     * @values primary, secondary, danger, ghost
     */
    variant?: "primary" | "secondary" | "ghost" | "danger";
    /**
     * Size of the button.
     * @values sm, md, lg
     */
    size?: "sm" | "md" | "lg";
    prefixIcon?: FunctionalComponent;
  }>(),
  {
    as: "button",
    variant: "primary",
    size: "md",
    isLoading: false,
  }
);

const slots = useSlots();
const attrs = useAttrs();
// check for aria-label on icon only buttons
if (props.prefixIcon && !slots.default && !attrs["aria-label"]) {
  console.warn("WARNING: Icon only buttons require 'aria-label' to be accessible");
}

const computedClasses = computed(() => {
  return {
    "hover:bg-orange-500 focus:ring-orange-400/50 active:bg-orange-300 text-orange-50 bg-orange-400 duration-100 border border-orange-400":
      props.variant === "primary",
    "hover:bg-gray-100 focus:ring-orange-400/50 active:bg-gray-200 text-gray-900 bg-white border":
      props.variant === "secondary",
    "hover:bg-red-500 focus:ring-red-600/50 active:bg-red-700 text-red-50 bg-red-600 duration-100 border border-red-600":
      props.variant === "danger",
    "hover:bg-gray-100 focus:ring-orange-400/50 active:bg-gray-200 text-gray-900 bg-transparent dark:text-gray-50":
      props.variant === "ghost",
    "shadow-sm": props.variant !== "ghost",
    "p-1": !slots.default && props.size === "sm",
    "p-2": !slots.default && props.size === "md",
    "p-3": !slots.default && props.size === "lg",
    "px-3 py-1 text-sm": slots.default && props.size === "sm",
    "px-4 py-1.5 text-sm": slots.default && props.size === "md",
    "px-5 py-2": slots.default && props.size === "lg",
    "opacity-50": attrs.disabled,
    "gap-1": slots.default && props.prefixIcon,
  };
});

const computedIconClasses = computed(() => ({
  "text-orange-900": props.variant === "primary",
  "text-gray-600": props.variant === "secondary",
}));
</script>
