<template>
  <div class="flex min-h-0 grow overflow-hidden">
    <div class="flex grow flex-col items-center p-4">
      <GameChessboard class="aspect-square max-h-full max-w-full grow" :game="game" :orientation="orientation" />
    </div>
    <GameContextSidebar :game="game" />
  </div>
</template>

<script setup lang="ts">
import GameChessboard from "@components/GameChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";

withDefaults(
  defineProps<{
    game: ReturnType<typeof useGame>;
    orientation?: "white" | "black";
  }>(),
  {
    orientation: "white",
  }
);
</script>
