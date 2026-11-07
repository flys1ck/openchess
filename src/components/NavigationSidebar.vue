<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child tooltip="Skakia">
            <RouterLink :to="navigationItems.analysis.to">
              <img :src="appLogo" alt="" class="size-8 rounded-lg" />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Skakia</span>
                <span class="text-muted-foreground truncate text-xs">v{{ appVersion }}</span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="{ icon, name, to } in mainNavigationItems" :key="to">
              <SidebarMenuButton as-child :is-active="isItemActive(to)" :tooltip="name">
                <RouterLink :to="to">
                  <Component :is="icon" />
                  <span>{{ name }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            :is-active="settingsDialog.isOpen"
            tooltip="Settings"
            @click="settingsDialog.isOpen = true"
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import appLogo from "@assets/images/logo.png";
import { type NavigationItem, navigationItems } from "@data/navigationItems";
import { Settings } from "@lucide/vue";
import { useSettingsDialog } from "@stores/useSettingsDialog";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNavigationItems = [navigationItems.analysis, navigationItems.studies, navigationItems.games];

const settingsDialog = useSettingsDialog();

const route = useRoute();
// Analysis is aliased to "/", so the path alone does not identify it; the route name does.
function isItemActive(to: NavigationItem["to"]) {
  return route.name === to || route.path.startsWith(to);
}

const appVersion = ref("");
onMounted(async () => {
  appVersion.value = await getVersion();
});
</script>
