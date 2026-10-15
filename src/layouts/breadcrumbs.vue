<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <NavigationSidebar />
    <SidebarInset class="min-w-0 overflow-y-auto">
      <Suspense>
        <div class="flex min-h-0 min-w-0 grow flex-col overflow-y-auto">
          <header class="flex h-12 shrink-0 items-center gap-2 border-b px-2 transition-[width,height] ease-linear">
            <SidebarTrigger class="ml-1" />
            <Separator orientation="vertical" class="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <template v-for="(breadcrumb, i) in breadcrumbsStore.breadcrumbs" :key="breadcrumb.name">
                  <BreadcrumbSeparator v-if="i !== 0" />
                  <BreadcrumbItem>
                    <BreadcrumbPage
                      v-if="i === breadcrumbsStore.breadcrumbs.length - 1"
                      class="flex items-center gap-2"
                    >
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
          </header>
          <RouterView />
        </div>
      </Suspense>
    </SidebarInset>
  </SidebarProvider>
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
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const breadcrumbsStore = useBreadcrumbs();
</script>
