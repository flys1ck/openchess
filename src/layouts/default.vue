<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <NavigationSidebar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
</script>
