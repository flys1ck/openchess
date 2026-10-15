<template>
  <div class="relative">
    <div ref="chessboardRef" class="aspect-square"></div>
    <!-- promotion overlay -->
    <div
      v-if="game.isPromoting.value"
      class="absolute top-0 left-0 z-10 bg-black/70"
      :style="overlayStyle"
      @click="game.cancelPromotion"
    >
      <div class="absolute top-0 left-0" :style="promotionBoardStyle">
        <div class="absolute flex h-1/2 w-1/8 items-center justify-center" :style="game.promotionStyles.value">
          <button
            v-for="piece in ['queen', 'rook', 'bishop', 'knight']"
            :key="piece"
            class="bg-muted hover:bg-primary aspect-square w-full scale-90 rounded-sm"
            @click.stop="game.promote(piece as PromotionPiece)"
          >
            <div :class="`${game.promotionColor.value} ${piece} h-full w-full bg-cover`" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PromotionPiece, useGame } from "@composables/useGame";
import { onKeyStroke, useElementBounding, useEventListener } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    game: ReturnType<typeof useGame>;
    orientation?: "white" | "black";
  }>(),
  {
    orientation: "white",
  }
);

const chessboardRef = ref<HTMLDivElement>();
const boardContainerRef = ref<HTMLElement | null>(null);
const wrapBounds = useElementBounding(chessboardRef);
const boardBounds = useElementBounding(boardContainerRef);
const overlayStyle = computed(() => {
  if (!wrapBounds.width.value || !wrapBounds.height.value) {
    return undefined;
  }
  return {
    width: `${wrapBounds.width.value}px`,
    height: `${wrapBounds.height.value}px`,
  };
});
const promotionBoardStyle = computed(() => {
  if (!boardBounds.width.value || !boardBounds.height.value) {
    return { width: "100%", height: "100%" };
  }
  return {
    width: `${boardBounds.width.value}px`,
    height: `${boardBounds.height.value}px`,
  };
});

function toPreviousMove() {
  props.game.toPreviousMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}

function toNextMove() {
  props.game.toNextMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}

function toFirstMove() {
  props.game.toFirstMove(() => {
    document.querySelector(`[data-node-id]`)?.scrollIntoView({ block: "center" });
  });
}

function toLastMove() {
  props.game.toLastMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}

onKeyStroke("ArrowLeft", toPreviousMove);
onKeyStroke("ArrowRight", toNextMove);
onKeyStroke("ArrowUp", (e) => {
  e.preventDefault();
  toFirstMove();
});
onKeyStroke("ArrowDown", (e) => {
  e.preventDefault();
  toLastMove();
});
onKeyStroke("f", props.game.toggleOrientation);
useEventListener(chessboardRef, "wheel", (e: WheelEvent) => {
  const { deltaY } = e;
  if (deltaY < 0) {
    toPreviousMove();
  } else {
    toNextMove();
  }
});

onMounted(async () => {
  if (!chessboardRef.value) return;
  props.game.initializeBoard(chessboardRef.value, {
    orientation: props.orientation,
  });
  boardContainerRef.value = chessboardRef.value.querySelector("cg-container");
});

watch(
  () => props.orientation,
  (orientation) => {
    props.game.setOrientation(orientation);
  }
);
</script>

<style>
@import "./../assets/css/chessground.css";
</style>
