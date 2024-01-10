<template>
  <main class="flex flex-grow overflow-hidden">
    <div class="flex flex-grow flex-col items-center bg-gray-100 p-4">
      <GameChessboard class="aspect-square max-h-full max-w-full flex-grow" :game="game" :orientation="orientation" />
    </div>
    <GameContextSidebar :game="game" />
  </main>
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
