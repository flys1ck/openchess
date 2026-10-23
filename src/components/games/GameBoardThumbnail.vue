<template>
  <div ref="boardRef" class="aspect-square overflow-hidden rounded-sm"></div>
</template>

<script setup lang="ts">
import { type FinalPosition } from "@utilities/moves";
import { useIntersectionObserver } from "@vueuse/core";
import { Chessground } from "chessground";
import type { Api } from "chessground/api";
import { onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  position: FinalPosition;
  orientation: "white" | "black";
}>();

const boardRef = ref<HTMLDivElement>();
let chessground: Api | undefined;

// A Chess.com month can hold hundreds of games, so boards are only built once they scroll into view.
const { stop } = useIntersectionObserver(boardRef, ([entry]) => {
  if (!entry?.isIntersecting || !boardRef.value) return;
  stop();
  chessground = Chessground(boardRef.value, {
    fen: props.position.fen,
    lastMove: props.position.lastMove,
    orientation: props.orientation,
    viewOnly: true,
    coordinates: false,
    animation: { enabled: false },
    drawable: { enabled: false, visible: false },
  });
});

watch(
  () => [props.position, props.orientation] as const,
  ([position, orientation]) => {
    chessground?.set({ fen: position.fen, lastMove: position.lastMove, orientation });
  }
);

onUnmounted(() => chessground?.destroy());
</script>

<style>
@import "./../../assets/css/chessground.css";
</style>
