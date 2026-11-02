<template>
  <GameMain :game="game" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyOrigin } from "@stores/useStudyOrigin";
import { useRoute } from "vue-router";

const route = useRoute();
const keptGame = useStudyOrigin().takeGame(route.fullPath);
const game = keptGame ?? useGame();
if (!keptGame) game.createNewGame();

definePage({
  alias: "/",
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([navigationItems.analysis]);
</script>
