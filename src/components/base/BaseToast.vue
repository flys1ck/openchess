<template>
  <ToastRoot
    v-model:open="isOpen"
    class="flex translate-x-[var(--radix-toast-swipe-move-x)] items-center justify-between rounded-md border border-l-4 border-orange-200 border-l-orange-400 bg-white p-2 pl-4 text-sm shadow"
  >
    <div class="flex flex-1 flex-col">
      <ToastTitle class="font-medium text-gray-900">{{ heading }}</ToastTitle>
      <ToastDescription v-if="description" class="mt-1 text-gray-700">{{ description }}</ToastDescription>
    </div>
    <ToastClose as-child>
      <BaseButton class="flex-shrink-0" variant="ghost" :prefix-icon="XMarkIcon" aria-label="Close Notification" />
    </ToastClose>
  </ToastRoot>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import { XMarkIcon } from "@heroicons/vue/24/solid";
import { ToastClose, ToastDescription, ToastRoot, ToastTitle } from "radix-vue";
import { ref } from "vue";

defineProps<{
  heading: string;
  description?: string;
}>();

const isOpen = ref(true);
</script>
