import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettings = defineStore("settings", () => {
  const engineLines = ref<[number]>([1]);
  const engineDepth = ref<[number]>([30]);

  return { engineLines, engineDepth };
});
