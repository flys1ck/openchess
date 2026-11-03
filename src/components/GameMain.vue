<template>
  <div class="flex min-h-0 grow overflow-hidden">
    <div class="[container-type:size] flex grow items-center justify-center p-4">
      <GameChessboard class="size-[min(100cqw,100cqh)]" :game="game" :orientation="orientation" />
    </div>
    <GameContextSidebar :game="game" :show-new-game="showNewGame" />
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
    showNewGame?: boolean;
  }>(),
  {
    orientation: "white",
  }
);
</script>
