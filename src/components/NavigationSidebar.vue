<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child tooltip="OpenChess">
            <RouterLink to="/analysis/">
              <img :src="appLogo" alt="" class="size-8 rounded-lg" />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">OpenChess</span>
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
            <SidebarMenuItem v-for="{ icon, text, to } in navigationItems" :key="to">
              <SidebarMenuButton as-child :is-active="isItemActive(to)" :tooltip="text">
                <RouterLink :to="to">
                  <Component :is="icon" />
                  <span>{{ text }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>

<script setup lang="ts">
import appLogo from "@assets/images/logo.png";
import { navigationItems } from "@data/navigationItems";
import { getVersion } from "@tauri-apps/api/app";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const route = useRoute();
function isItemActive(to: string) {
  return route.path.startsWith(to) || route.matched.some((record) => record.path === to);
}

const appVersion = ref("");
onMounted(async () => {
  appVersion.value = await getVersion();
});
</script>
