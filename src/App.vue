<template>
  <TooltipProvider :delay-duration="200">
    <RouterView />
    <Toaster />
  </TooltipProvider>
</template>

<script setup lang="ts">
import { checkForAppUpdate } from "@utilities/updater";
import { onMounted } from "vue";
import "vue-sonner/style.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

onMounted(() => {
  checkForAppUpdate();
});
</script>
