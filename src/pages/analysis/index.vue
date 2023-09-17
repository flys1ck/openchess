<template>
  <main class="flex flex-grow overflow-hidden">
    <div class="flex flex-grow flex-col p-4">
      <GameChessboard class="min-h-0 max-w-4xl flex-shrink-0 flex-grow" :game="game" />
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
      <BaseTextarea v-model="pgn" />
      <BaseButton @click="importPgn">Import</BaseButton>
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import GameChessboard from "@components/GameChessboard.vue";
import BaseButton from "@components/base/BaseButton.vue";
import BaseTextarea from "@components/base/BaseTextarea.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref } from "vue";
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

const pgn = ref("");
function importPgn() {
  game.tree.fromPgn(pgn.value);
}
</script>
