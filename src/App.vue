<template>
  <ToastProvider>
    <RouterView />
    <ToastViewport class="fixed bottom-0 right-0 z-50 flex w-96 flex-col space-y-2 p-8 outline-none">
      <BaseToast v-for="toast in toasts" :key="toast.heading" :heading="toast.heading" />
    </ToastViewport>
  </ToastProvider>
</template>

<script setup lang="ts">
import BaseToast from "@components/base/BaseToast.vue";
import { useToasts } from "@stores/useToasts";
import { ToastProvider, ToastViewport } from "radix-vue";

const { toasts } = useToasts();
</script>
