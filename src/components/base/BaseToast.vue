<template>
  <ToastRoot v-model:open="isOpen"
    class="bg-white rounded-md p-2 border shadow flex items-center justify-between text-sm">
    <div class="flex flex-col flex-1">
      <ToastTitle class="font-medium text-gray-900">{{ heading }}</ToastTitle>
      <ToastDescription v-if="description" class="text-gray-500 mt-1">{{ description }}</ToastDescription>
    </div>
    <ToastClose as-child>
      <BaseButton class="flex-shrink-0" variant="ghost" :prefix-icon="XMarkIcon" aria-label="Close Notification" />
    </ToastClose>
  </ToastRoot>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle } from 'radix-vue'
import { XMarkIcon } from "@heroicons/vue/24/solid"
import { ref } from 'vue';

defineProps<{
  heading: string,
  description?: string,
}>()

const isOpen = ref(true)
</script>
