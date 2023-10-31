import { defineStore } from "pinia";
import { ref } from "vue";

interface Toast {
  heading: string;
  description?: string;
}

export const useToasts = defineStore("toasts", () => {
  const toasts = ref<Toast[]>([]);

  function addToast(toast: Toast) {
    toasts.value.push(toast);
  }

  return { toasts, addToast };
});
