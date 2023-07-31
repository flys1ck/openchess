<template>
  <template v-if="node.move">
    <!-- white's move -->
    <template v-if="node.ply % 2 === 1">
      <span class="col-span-2 font-thin border-r pr-2 py-0.5 text-sm flex justify-end items-center">
        {{ moveNumber }}
      </span>
      <button
        :data-node-id="node.id"
        class="text-left pl-4 col-span-7 font-light py-0.5"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ node.move.san }}<span v-if="resolvedAnnotation">{{ resolvedAnnotation }}</span>
      </button>
    </template>
    <!-- black's move after a previous comment -->
    <template v-else-if="node.previousPosition?.comment && node.ply % 2 === 0">
      <span class="col-span-2 font-thin border-r pr-2 py-0.5 text-sm flex justify-end items-center">
        {{ moveNumber }}
      </span>
      <span class="col-span-7 text-gray-500 pl-4">...</span>
      <button
        :data-node-id="node.id"
        class="text-left pl-4 col-span-7 font-light py-0.5"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ node.move.san }}<span v-if="resolvedAnnotation">{{ resolvedAnnotation }}</span>
      </button>
    </template>
    <!-- black's move -->
    <template v-else>
      <button
        :data-node-id="node.id"
        class="text-left pl-4 col-span-7 font-light py-0.5"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ node.move.san }}<span v-if="resolvedAnnotation">{{ resolvedAnnotation }}</span>
      </button>
    </template>
  </template>
  <template v-if="comment">
    <span v-if="node.ply % 2 === 1" class="col-span-7 text-gray-500 pl-4">...</span>
    <p class="col-span-full text-xs text-gray-700 border-y bg-gray-100 p-2 shadow-inner relative break-words">
      <span
        class="absolute inset-0"
        :class="[
          { 'border-l-4': node.move?.piece.color === 'white', 'border-r-4': node.move?.piece.color === 'black' },
          node.id === activeNodeId ? 'border-orange-300' : 'border-gray-300',
        ]"
        aria-hidden
      />
      {{ comment }}
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

const comment = computed(() => {
  if (!props.node.comment) return;
  return props.node.comment.replaceAll("@@StartBracket@@", "(").replaceAll("@@EndBracket@@", ")");
});

const nags: Record<string, string> = {
  $1: "!",
  $2: "?",
  $3: "‼",
  $4: "⁇",
  $5: "⁉",
  $6: "⁈",
  $7: "□",
  $10: "=",
  $13: "∞",
  $14: "⩲",
  $15: "⩱",
  $16: "±",
  $17: "∓",
  $18: "+-",
  $19: "-+",
  $22: "⨀",
  $32: "⟳",
  $36: "→",
  $40: "↑",
  $132: "⇆",
  $220: "D",
};

const resolvedAnnotation = computed(() => {
  if (!props.node.move?.annotations?.length) return;

  return props.node.move.annotations.reduce((acc, nag) => {
    return `${acc}${nags[nag]}`;
  }, "");
});
</script>
