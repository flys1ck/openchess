<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <NavigationSidebar />
    <div class="flex-grow flex flex-col overflow-auto">
      <nav aria-label="Breadcrumb">
        <ol role="list" class="flex items-center p-2 border-b text-sm">
          <li v-for="(route, i) in matchedRoutes" :key="route.path">
            <div class="flex items-center">
              <ChevronRightIcon v-if="i !== 0" class="h-5 w-5 flex-shrink-0 text-gray-400 mx-2" aria-hidden="true" />
              <RouterLink
                :to="route.path"
                class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                activeClass="text-gray-700"
                :aria-current="route.path ? 'page' : undefined"
              >
                {{ route.fullPath }}
              </RouterLink>
            </div>
          </li>
        </ol>
      </nav>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
import { ChevronRightIcon } from "@heroicons/vue/20/solid";
import { computed } from "vue";
import { START_LOCATION, useRoute, useRouter } from "vue-router/auto";

const router = useRouter();
const route = useRoute();

/**
 * Removes duplicated routes from `route.matched`.
 *
 * @see https://github.com/JohnCampionJr/vite-plugin-vue-layouts/issues/55
 * @see https://github.com/JohnCampionJr/vite-plugin-vue-layouts/issues/92
 */
const matchedRoutes = computed(() => {
  const paths = new Set();

  return route.matched
    .filter((matchedRoute) => {
      if (paths.has(matchedRoute.path)) {
        return false;
      } else {
        paths.add(matchedRoute.path);
        return true;
      }
    })
    .map((filteredRoute) => {
      return router.resolve(filteredRoute, START_LOCATION);
    });
});
</script>
