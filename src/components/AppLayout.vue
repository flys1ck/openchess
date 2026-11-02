<template>
  <SidebarProvider class="h-screen overflow-hidden">
    <NavigationSidebar />
    <SidebarInset class="min-w-0 overflow-y-auto">
      <div class="flex min-h-0 min-w-0 grow flex-col overflow-y-auto">
        <header class="flex h-12 shrink-0 items-center gap-2 border-b px-2 transition-[width,height] ease-linear">
          <SidebarTrigger class="ml-1" />
          <Separator orientation="vertical" class="mr-2" />
          <template v-if="studyOrigin.returnLink">
            <Button variant="outline" size="sm" class="shrink-0" as-child>
              <RouterLink :to="studyOrigin.returnLink.to">
                <ArrowLeft data-icon="inline-start" />
                {{ studyOrigin.returnLink.label }}
              </RouterLink>
            </Button>
            <Separator orientation="vertical" class="mx-2" />
          </template>
          <Breadcrumb>
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
        </header>
        <h1 class="sr-only" aria-live="polite">{{ breadcrumbsStore.breadcrumbs.at(-1)?.name }}</h1>
        <!--
          Suspense must stay inside RouterView: around it, Vue holds back RouterView updates while an async page is pending, and a page that fails to load blocks navigation.
          timeout="0" unmounts the previous page right away: kept alive, its route param watchers would fire with the next route's params.
        -->
        <RouterView v-slot="{ Component: page }">
          <Suspense v-if="page" :timeout="0">
            <Component :is="page" />
          </Suspense>
        </RouterView>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import NavigationSidebar from "@components/NavigationSidebar.vue";
import { ArrowLeft } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyOrigin } from "@stores/useStudyOrigin";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const breadcrumbsStore = useBreadcrumbs();
const studyOrigin = useStudyOrigin();
</script>
