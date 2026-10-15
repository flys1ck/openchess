<template>
  <main class="flex grow overflow-hidden">
    <div class="bg-muted flex grow flex-col items-center p-4">
      <GameChessboard class="aspect-square max-h-full max-w-full grow" :game="game" :orientation="orientation" />
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
