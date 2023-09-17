<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <NavigationSidebar />
    <div class="flex flex-grow flex-col">
      <nav aria-label="Breadcrumb" class="flex-shrink-0">
        <ol role="list" class="flex items-center border-b p-2 text-sm">
          <li v-for="(breadcrumb, i) in breadcrumbsStore.breadcrumbs" :key="breadcrumb.to">
            <div class="flex items-center">
              <ChevronRightIcon v-if="i !== 0" class="mx-2 h-5 w-5 flex-shrink-0 text-gray-400" />
              <RouterLink
                :to="breadcrumb.to"
                class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                activeClass="text-orange-400"
                :aria-current="route.path ? 'page' : undefined"
              >
                <Component v-if="breadcrumb.icon" :is="breadcrumb.icon" class="h-5 w-5 flex-shrink-0" />
                {{ breadcrumb.name }}
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
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router/auto";

const route = useRoute();
const breadcrumbsStore = useBreadcrumbs();
</script>
