<template>
  <GameMain :game="game" />
</template>

<script setup lang="ts">
import GameMain from "@/components/GameMain.vue";
import { useGame } from "@/composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage } from "vue-router/auto";

const game = useGame();
game.createNewGame();

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
</script>
