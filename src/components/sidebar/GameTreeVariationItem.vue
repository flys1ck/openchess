<template>
  <button
    v-if="node.move"
    class="relative inline-flex gap-0.5 rounded border px-px"
    :class="node.id === activeNodeId ? 'border-orange-300 bg-orange-200' : 'border-transparent hover:bg-gray-200'"
    @click="$emit('nodeselect', node)"
  >
    <span v-if="node.previousPosition?.variations.length || node.ply % 2 === 1">{{ moveNumber }}. </span>
    <span v-if="node.previousPosition?.variations.length && node.ply % 2 === 0">...</span>
    <span>{{ node.move.san }}</span>
  </button>
  <GameTreeVariationItem
    v-if="node.nextPosition && !node.variations.length"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    :variation-depth="variationDepth"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
  <div v-if="node.variations.length" class="relative border-l-2 border-gray-400 pl-1">
    <span
      v-if="variationDepth !== 1"
      class="absolute left-0 top-0 inline-block w-2.5 flex-shrink-0 -translate-x-full border-t-2 border-gray-400"
      aria-hidden="true"
    />
    <div class="flex -translate-x-1.5 items-start gap-0.5">
      <span class="inline-block w-2 flex-shrink-0 translate-y-2 border-t-2 border-gray-400" aria-hidden="true" />
      <div class="inline-block">
        <GameTreeVariationItem
          v-if="node.nextPosition"
          :node="node.nextPosition"
          :active-node-id="activeNodeId"
          :variation-depth="variationDepth + 1"
          @nodeselect="(node) => $emit('nodeselect', node)"
        />
      </div>
    </div>
    <div v-for="variation in node.variations" :key="variation.id" class="flex -translate-x-1.5 items-start gap-0.5">
      <span class="inline-block w-2 flex-shrink-0 translate-y-2 border-t-2 border-gray-400" aria-hidden="true" />
      <div>
        <GameTreeVariationItem
          :node="variation"
          :active-node-id="activeNodeId"
          :variation-depth="variationDepth + 1"
          @nodeselect="(variation) => $emit('nodeselect', variation)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PositionNode } from "@composables/useGameTree";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    node: PositionNode;
    activeNodeId?: string;
    variationDepth?: number;
  }>(),
  { variationDepth: 1 }
);

defineEmits<{
  nodeselect: [node: PositionNode];
}>();

const moveNumber = computed(() => {
  return Math.ceil(props.node.ply / 2);
});
</script>
