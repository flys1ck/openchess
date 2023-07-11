<template>
  <main class="flex-grow overflow-y-auto overflow-x-hidden p-4 flex">
    <div class="mx-auto">
      <TheChessboard :game="analysisBoard.game" />
      <BaseInputGroup
        class="mt-8"
        v-model.trim="analysisBoard.game.fen"
        label="FEN"
        :schema="z.string().refine(isFEN)"
      />
      <BaseInputGroup
        v-if="analysisBoard.game.tree.activeNode"
        class="mt-8"
        v-model.trim="analysisBoard.game.tree.activeNode.comment"
        label="Comment"
        :schema="z.string().optional()"
      />
    </div>
  </main>
  <GameContextSidebar :game="analysisBoard.game" />
</template>

<script setup lang="ts">
import TheChessboard from "@components/TheChessboard.vue";
import BaseInputGroup from "@components/base/BaseInputGroup.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useAnalysisBoard } from "@stores/useAnalysisBoard";
import { isFEN } from "@utilities/validators";
import { definePage } from "vue-router/auto";
import { z } from "zod";

definePage({
  alias: "/",
});

const analysisBoard = useAnalysisBoard();
</script>
