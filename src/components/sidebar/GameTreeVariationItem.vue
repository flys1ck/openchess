<template>
  <button
    v-if="node.move"
    class="relative px-px rounded border"
    :class="node.id === activeNodeId ? 'border-orange-300 bg-orange-200' : 'hover:bg-gray-200 border-transparent'"
    @click="$emit('nodeselect', node)"
  >
    <span v-if="node.previousPosition?.variations.length || node.ply % 2 === 1">{{ moveNumber }}. </span>
    <span v-if="node.previousPosition?.variations.length && node.ply % 2 === 0">... </span>
    <span>{{ node.move.san }}</span>
  </button>
  <GameTreeVariationItem
    v-if="node.nextPosition && !node.variations.length"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    :variation-depth="variationDepth"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
  <div v-if="node.variations.length" class="pl-1 border-l-2 border-gray-400 relative">
    <span
      v-if="variationDepth !== 1"
      class="w-2.5 flex-shrink-0 border-t-2 border-gray-400 inline-block -translate-x-full absolute top-0 left-0"
      aria-hidden="true"
    />
    <div class="flex items-start gap-0.5 -translate-x-1.5">
      <span class="w-2 flex-shrink-0 border-t-2 border-gray-400 inline-block translate-y-2" aria-hidden="true" />
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
    <div v-for="variation in node.variations" :key="variation.id" class="flex items-start -translate-x-1.5 gap-0.5">
      <span class="w-2 border-t-2 border-gray-400 inline-block translate-y-2" aria-hidden="true" />
      <GameTreeVariationItem
        :node="variation"
        :active-node-id="activeNodeId"
        :variation-depth="variationDepth + 1"
        @nodeselect="(variation) => $emit('nodeselect', variation)"
      />
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
    variationDepth: number;
  }>(),
  { variationDepth: 1 }
);

defineEmits<{
  nodeselect: [node: PositionNode];
}>();

const moveNumber = computed(() => {
  return Math.ceil(props.node.ply / 2);
});

const comment = computed(() => {
  if (!props.node.comment) return;
  return props.node.comment.replaceAll("@@StartBracket@@", "(").replaceAll("@@EndBracket@@", ")");
});
</script>
