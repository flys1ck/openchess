<template>
  <TooltipProvider :delay-duration="200">
    <AppLayout />
    <Toaster />
  </TooltipProvider>
</template>

<script setup lang="ts">
import AppLayout from "@components/AppLayout.vue";
import { checkForAppUpdate } from "@utilities/updater";
import { onMounted } from "vue";
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

onMounted(() => {
  checkForAppUpdate();
});
</script>
