<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <NavigationSidebar />
    <SidebarInset class="min-w-0 overflow-hidden">
      <header class="flex h-12 shrink-0 items-center gap-2 border-b px-2">
        <SidebarTrigger class="-ml-1" />
      </header>
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
</script>
