<template>
  <template v-if="node.move">
    <!-- white's move -->
    <template v-if="node.ply % 2 === 1">
      <span class="col-span-2 flex items-center justify-end border-r py-0.5 pr-2 text-sm font-thin">
        {{ moveNumber }}
      </span>
      <button
        :data-node-id="node.id"
        class="col-span-7 py-0.5 pl-4 text-left font-light"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ node.move.san }}<span v-if="resolvedAnnotation">{{ resolvedAnnotation }}</span>
      </button>
    </template>
    <!-- black's move after a previous comment -->
    <template
      v-else-if="
        (node.previousPosition?.previousPosition?.variations.length || node.previousPosition?.comment) &&
        node.ply % 2 === 0
      "
    >
      <span class="col-span-2 flex items-center justify-end border-r py-0.5 pr-2 text-sm font-thin">
        {{ moveNumber }}
      </span>
      <span class="col-span-7 pl-4 text-gray-500">...</span>
      <button
        :data-node-id="node.id"
        class="col-span-7 py-0.5 pl-4 text-left font-light"
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
        class="col-span-7 py-0.5 pl-4 text-left font-light"
        :class="node.id === activeNodeId ? 'bg-orange-300' : 'hover:bg-gray-200'"
        @click="$emit('nodeselect', node)"
      >
        {{ node.move.san }}<span v-if="resolvedAnnotation">{{ resolvedAnnotation }}</span>
      </button>
    </template>
  </template>
  <template v-if="node.comment || node.previousPosition?.variations.length">
    <span
      v-if="(node.comment || node.previousPosition?.variations.length) && node.ply % 2 === 1"
      class="col-span-7 pl-4 text-gray-500"
      >{{ node.nextPosition && "..." }}</span
    >
    <div class="relative col-span-full break-words bg-gray-100 p-2 text-xs text-gray-700 shadow-inner">
      <span
        class="absolute inset-y-0"
        :class="[
          {
            'left-0 border-l-4': node.move?.piece.color === 'white',
            'right-0 border-r-4': node.move?.piece.color === 'black',
          },
          node.id === activeNodeId ? 'border-orange-300' : 'border-gray-300',
        ]"
        aria-hidden
      />
      <p v-html="node.comment" />
      <!-- variations -->
      <div v-for="variation in node.previousPosition?.variations" :key="variation.id" class="space-x-0.5">
        <GameTreeVariationItem
          v-if="variation"
          :node="variation"
          :active-node-id="activeNodeId"
          @nodeselect="(node) => $emit('nodeselect', node)"
        />
      </div>
    </div>
  </template>
  <GameTreeItem
    v-if="node.nextPosition"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
</template>

<script setup lang="ts">
import GameTreeVariationItem from "@components/sidebar/GameTreeVariationItem.vue";
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

const nags: Record<number, string> = {
  1: "!",
  2: "?",
  3: "‼",
  4: "⁇",
  5: "⁉",
  6: "⁈",
  7: "□",
  10: "=",
  13: "∞",
  14: "⩲",
  15: "⩱",
  16: "±",
  17: "∓",
  18: "+-",
  19: "-+",
  22: "⨀",
  32: "⟳",
  36: "→",
  40: "↑",
  132: "⇆",
  220: "D",
};

const resolvedAnnotation = computed(() => {
  if (!props.node.move?.annotations?.length) return;

  return props.node.move.annotations.reduce((acc, nag) => {
    return `${acc}${nags[nag]}`;
  }, "");
});
</script>
