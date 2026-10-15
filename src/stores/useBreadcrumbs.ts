import { defineStore } from "pinia";
import { ref, type Component } from "vue";
import { RouteLocationRaw } from "vue-router";
// import type { RouteNamedMap } from "vue-router/auto-routes";

interface Breadcrumb {
  icon?: Component;
  name: string;
  to: RouteLocationRaw;
}

export const useBreadcrumbs = defineStore("breadcrumbs", () => {
  const breadcrumbs = ref<Breadcrumb[]>([]);

  function setBreadcrumbs(crumbs: Breadcrumb[]) {
    breadcrumbs.value = crumbs;
  }

  return { breadcrumbs, setBreadcrumbs };
});
