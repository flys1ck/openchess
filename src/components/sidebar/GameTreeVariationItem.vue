<template>
  <!-- TODO: handle nested variations -->
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
    v-if="node.nextPosition"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
</template>

<script setup lang="ts">
import { PositionNode } from "@composables/useGameTree";
import { computed } from "vue";

const props = defineProps<{
  node: PositionNode;
  activeNodeId?: string;
}>();

defineEmits<{
  nodeselect: [node: PositionNode];
}>();

const moveNumber = computed(() => {
  return Math.ceil(props.node.ply / 2);
});
</script>
