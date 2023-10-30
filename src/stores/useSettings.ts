import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useSettings = defineStore("settings", () => {
  const engineLines = useLocalStorage<[number]>("engineLines", [1]);
  const engineDepth = useLocalStorage<[number]>("engineDepth", [30]);

  return { engineLines, engineDepth };
});
