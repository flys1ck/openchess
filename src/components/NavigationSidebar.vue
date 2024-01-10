<template>
  <div class="flex flex-shrink-0 flex-col bg-gray-800 pt-5">
    <!-- Navigation -->
    <div class="mt-5 flex flex-grow flex-col justify-between">
      <nav class="flex flex-1 flex-col gap-1">
        <RouterLink v-for="{ icon, text, to } in navigationItems" :to="to" :key="to">
          <div
            class="transition-color ml-1.5 flex flex-col items-center gap-2 overflow-hidden rounded-l-lg p-1.5 font-medium text-gray-50 hover:bg-gray-700"
            :class="{ 'bg-gray-700': route.path.startsWith(to) }"
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
