
<template>
  <ToastProvider>
    <RouterView />
    <BaseToast v-for="toast in toasts" :key="toast.heading" :heading="toast.heading" />
    <ToastViewport class="fixed bottom-0 right-0 flex flex-col p-8 w-96 max-w-screen z-50 outline-none" />
  </ToastProvider>
</template>

<script setup lang="ts">
import BaseToast from '@/components/base/BaseToast.vue';
import { useToasts } from '@/stores/useToasts';
import { ToastProvider, ToastViewport } from 'radix-vue';

const { toasts } = useToasts()
</script>
