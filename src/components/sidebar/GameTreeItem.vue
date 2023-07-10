<template>
  <template v-if="node.move">
    <!-- white's move -->
    <template v-if="node.ply % 2 === 1">
      <span class="col-span-2 font-thin border-r pr-2 py-0.5 text-sm flex justify-end items-center">
        {{ moveNumber }}
      </span>
      <button
        class="text-left pl-4 col-span-7 font-light py-0.5 rounded"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ san }}
      </button>
    </template>
    <!-- black's move after a previous comment -->
    <template v-else-if="node.previousPosition?.comment && node.ply % 2 === 0">
      <span class="col-span-2 font-thin border-r pr-2 py-0.5 text-sm flex justify-end items-center">
        {{ moveNumber }}
      </span>
      <span class="col-span-7 text-gray-500 pl-4">...</span>
      <button
        class="text-left pl-4 col-span-7 font-light py-0.5 rounded"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ san }}
      </button>
    </template>
    <!-- black's move -->
    <template v-else>
      <button
        class="text-left pl-4 col-span-7 font-light py-0.5 rounded"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ san }}
      </button>
    </template>
  </template>
  <template v-if="node.comment">
    <span v-if="node.ply % 2 === 1" class="col-span-7 text-gray-500 pl-4">...</span>
    <p class="col-span-full text-xs text-gray-700 border-y bg-gray-100 p-2 shadow-inner">
      {{ node.comment }}
    </p>
  </template>
  <GameTreeItem
    v-if="node.nextPosition"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
</template>

<script setup lang="ts">
import { PositionNode } from "@composables/useGameTree";
import { toSAN } from "@utilities/move";
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
const san = computed(() => {
  if (!props.node.move) return;

  return toSAN(props.node.move);
});
</script>
