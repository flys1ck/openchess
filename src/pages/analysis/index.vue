<template>
  <main class="flex-grow overflow-y-auto overflow-x-hidden p-4 flex">
    <div class="flex-grow">
      <TheChessboard :game="game" />
      <div class="max-w-3xl">
        <!-- <BaseInputGroup class="mt-8" v-model.trim="game.fen.value" label="FEN" :schema="z.string().refine(isFEN)" />
        <BaseInputGroup
          v-if="game.tree.activeNode"
          class="mt-8"
          v-model.trim="game.tree.activeNode.value?.comment"
          label="Comment"
          :schema="z.string().optional()"
        /> -->
      </div>
    </div>
  </main>
  <GameContextSidebar :game="game" />
</template>

<script setup lang="ts">
import TheChessboard from "@components/TheChessboard.vue";
import BaseInputGroup from "@components/base/BaseInputGroup.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { isFEN } from "@utilities/validators";
import { ref } from "vue";
import { definePage } from "vue-router/auto";
import { z } from "zod";

definePage({
  alias: "/",
});

const game = useGame();
</script>
