<template>
  <div class="flex h-screen overflow-hidden">
    <NavigationSidebar />
    <Suspense>
      <div class="flex grow flex-col overflow-y-auto">
        <Breadcrumb class="shrink-0 border-b p-2">
          <BreadcrumbList>
            <template v-for="(breadcrumb, i) in breadcrumbsStore.breadcrumbs" :key="breadcrumb.name">
              <BreadcrumbSeparator v-if="i !== 0" />
              <BreadcrumbItem>
                <BreadcrumbPage v-if="i === breadcrumbsStore.breadcrumbs.length - 1" class="flex items-center gap-2">
                  <Component v-if="breadcrumb.icon" :is="breadcrumb.icon" class="size-4 shrink-0" />
                  {{ breadcrumb.name }}
                </BreadcrumbPage>
                <BreadcrumbLink v-else as-child>
                  <RouterLink :to="breadcrumb.to" class="flex items-center gap-2">
                    <Component v-if="breadcrumb.icon" :is="breadcrumb.icon" class="size-4 shrink-0" />
                    {{ breadcrumb.name }}
                  </RouterLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </template>
          </BreadcrumbList>
        </Breadcrumb>
        <RouterView />
      </div>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbsStore = useBreadcrumbs();
</script>
