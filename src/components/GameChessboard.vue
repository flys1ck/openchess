<template>
  <div class="relative">
    <div ref="chessboardRef" class="aspect-square"></div>
    <!-- promotion overlay -->
    <div
      v-if="game.isPromoting.value"
      :style="`width: ${overlayWidth}px`"
      @click="game.cancelPromotion"
      class="absolute left-0 top-0 z-10 aspect-square bg-black/70"
    >
      <div class="absolute flex h-1/2 w-1/8 items-center justify-center" :style="game.promotionStyles.value">
        <button
          v-for="piece in ['queen', 'rook', 'bishop', 'knight']"
          :key="piece"
          class="aspect-square w-full scale-90 rounded bg-slate-300 hover:bg-orange-300"
          @click.stop="game.promote(piece as PromotionPiece)"
        >
          <div :class="`${game.promotionColor.value} ${piece} h-full w-full  bg-cover`" />
        </button>
      </div>
    </div>
    <!-- e2e test helper -->
    <div
      v-if="mode === 'development'"
      :style="`width: ${overlayWidth}px`"
      class="pointer-events-none absolute left-0 top-0 grid aspect-square grid-cols-8"
    >
      <template v-for="rank in ['1', '2', '3', '4', '5', '6', '7', '8'].reverse()" :key="rank">
        <template v-for="file in ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']" :key="file">
          <span :data-test="`square-${file}${rank}`"></span>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PromotionPiece, useGame } from "@composables/useGame";
import { useElementBounding } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    game: ReturnType<typeof useGame>;
    orientation?: "white" | "black";
  }>(),
  {
    orientation: "white",
  }
);

const mode = import.meta.env.MODE;
const chessboardRef = ref<HTMLDivElement>();

// chessground board size are always divisible by 8
// adjust size of overlay to match board size
const chessboardBounds = useElementBounding(chessboardRef);
const overlayWidth = computed(() => {
  return chessboardBounds.width.value - (chessboardBounds.width.value % 8);
});

onMounted(async () => {
  if (!chessboardRef.value) return;
  props.game.initializeBoard(chessboardRef.value, {
    orientation: props.orientation,
  });
});
</script>

<style>
/* TODO: import not resolving correctly, when using module name or alias */
@import "./../assets/css/chessground.css";
</style>
