<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    <NavigationSidebar />
    <div class="flex-grow overflow-y-auto">
      <nav aria-label="Breadcrumb">
        <ol role="list" class="flex items-center p-2 border-b text-sm">
          <li v-for="(breadcrumb, i) in breadcrumbsStore.breadcrumbs" :key="breadcrumb.to">
            <div class="flex items-center">
              <ChevronRightIcon v-if="i !== 0" class="h-5 w-5 flex-shrink-0 text-gray-400 mx-2" />
              <RouterLink
                :to="breadcrumb.to"
                class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
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
