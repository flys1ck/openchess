<template>
  <div class="flex flex-shrink-0 flex-col border-r border-gray-300 bg-gray-200">
    <!-- Navigation -->
    <div class="mt-10 flex flex-grow flex-col justify-between">
      <nav class="flex flex-1 flex-col gap-2 p-2">
        <RouterLink v-for="{ icon, text, to } in navigationItems" :to="to" :key="to">
          <div
            class="transition-color flex flex-col items-center gap-1 overflow-hidden rounded-lg p-2 font-medium"
            :class="route.path.startsWith(to) ? 'bg-gray-700 text-gray-50' : 'text-gray-500 hover:bg-gray-300'"
          >
            <Component :is="icon" class="h-6 w-6" :class="{ 'text-orange-400': route.path.startsWith(to) }" />
            <span class="text-xs lowercase">{{ text }}</span>
          </div>
        </RouterLink>
      </nav>
      <span class="text-center text-[0.5rem] text-gray-600">v{{ appVersion }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigationItems } from "@data/navigationItems";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router/auto";

const route = useRoute();

const appVersion = ref("");
onMounted(async () => {
  appVersion.value = await getVersion();
});
</script>
