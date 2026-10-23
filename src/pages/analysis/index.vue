<template>
  <GameMain :game="game" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";

const game = useGame();
game.createNewGame();

definePage({
  alias: "/",
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([navigationItems.analysis]);
</script>
