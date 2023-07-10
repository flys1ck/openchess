import { useGame } from "@composables/useGame";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAnalysisBoard = defineStore("analysisBoard", () => {
  const game = ref(useGame());
  game.value.createNewGame();

  return {
    game,
  };
});
