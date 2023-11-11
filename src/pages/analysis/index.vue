<template>
  <main class="flex flex-grow overflow-hidden">
    <div class="flex flex-grow flex-col bg-gray-100">
      <GameChessboard class="mx-auto my-4 aspect-square flex-grow overflow-hidden" :game="game" />
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
