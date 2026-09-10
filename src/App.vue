<template>
  <ToastProvider>
    <RouterView />
    <ToastViewport class="fixed right-0 bottom-0 z-50 flex w-96 flex-col space-y-2 p-8 outline-hidden">
      <BaseToast
        v-for="toast in toasts"
        :key="toast.heading"
        :heading="toast.heading"
        :description="toast.description"
      />
    </ToastViewport>
  </ToastProvider>
</template>

<script setup lang="ts">
import BaseToast from "@components/base/BaseToast.vue";
import { useToasts } from "@stores/useToasts";
import { checkForAppUpdate } from "@utilities/updater";
import { ToastProvider, ToastViewport } from "radix-vue";
import { onMounted } from "vue";

const { toasts } = useToasts();

onMounted(() => {
  checkForAppUpdate();
});
</script>
