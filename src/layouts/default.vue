<template>
  <div class="flex h-screen overflow-hidden">
    <NavigationSidebar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
</script>
