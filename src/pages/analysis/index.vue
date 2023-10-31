<template>
  <main class="flex flex-grow overflow-hidden">
    <div class="flex flex-grow flex-col bg-gray-100">
      <GameChessboard class="flex-grow overflow-hidden mx-auto my-4 aspect-square" :game="game" />
      <!-- <div class="max-w-3xl"> -->
      <!-- <BaseInputGroup class="mt-8" v-model.trim="game.fen.value" label="FEN" :schema="z.string().refine(isFEN)" /> -->
      <!-- <BaseInputGroup
          v-if="game.tree.activeNode"
          class="mt-8"
          v-model.trim="game.tree.activeNode.value?.comment"
          label="Comment"
          :schema="z.string().optional()"
        /> -->
      <!-- </div> -->
      <!-- <BaseTextarea v-model="pgn" />
      <BaseButton @click="importPgn">Import</BaseButton> -->
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import GameChessboard from "@components/GameChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage } from "vue-router/auto";

definePage({
  alias: "/",
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Analysis",
    to: "/analysis/",
  },
]);

const game = useGame();
game.createNewGame();
</script>
