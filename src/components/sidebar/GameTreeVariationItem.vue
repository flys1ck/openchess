<template>
  <p v-if="node.startingComment" class="inline" v-html="node.startingComment" />
  <button
    v-if="node.move"
    :data-node-id="node.id"
    class="text-primary relative inline-flex gap-0.5 rounded-sm border px-px font-bold"
    :class="node.id === activeNodeId ? 'border-primary/60 bg-primary/10' : 'hover:bg-muted border-transparent'"
    @click="$emit('nodeselect', node)"
  >
    <span v-if="node.previousPosition?.variations.length || node.ply % 2 === 1">{{ moveNumber }}. </span>
    <span v-if="node.previousPosition?.variations.length && node.ply % 2 === 0">...</span>
    <span>{{ node.move.san }}</span>
  </button>
  <p v-if="node.comment" class="inline" v-html="node.comment" />
  <GameTreeVariationItem
    v-if="node.nextPosition && !node.variations.length"
    :node="node.nextPosition"
    :active-node-id="activeNodeId"
    :variation-depth="variationDepth"
    @nodeselect="(node) => $emit('nodeselect', node)"
  />
  <div v-if="node.variations.length" class="border-muted-foreground/50 relative border-l-2 pl-1">
    <span
      v-if="variationDepth !== 1"
      class="border-muted-foreground/50 absolute top-0 left-0 inline-block w-2.5 shrink-0 -translate-x-full border-t-2"
      aria-hidden="true"
    />
    <div class="flex -translate-x-1.5 items-start gap-0.5">
      <span class="border-muted-foreground/50 inline-block w-2 shrink-0 translate-y-2 border-t-2" aria-hidden="true" />
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
      <span class="border-muted-foreground/50 inline-block w-2 shrink-0 translate-y-2 border-t-2" aria-hidden="true" />
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
