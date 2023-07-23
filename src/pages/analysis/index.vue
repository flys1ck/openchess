<template>
  <main class="flex-grow overflow-y-auto flex">
    <div class="flex-grow p-4 flex flex-col overflow-y-auto">
      <GameChessboard class="flex-grow min-h-0 flex-shrink-0 max-w-4xl" :game="game" />
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
