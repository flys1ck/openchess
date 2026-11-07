import { defineStore } from "pinia";
import { ref } from "vue";

export const useSettingsDialog = defineStore("settingsDialog", () => {
  const isOpen = ref(false);

  return { isOpen };
});
