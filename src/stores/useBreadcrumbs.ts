import { defineStore } from "pinia";
import { ref, type FunctionalComponent } from "vue";
import { RouteLocationRaw } from "vue-router";
// import type { RouteNamedMap } from "vue-router/auto-routes";

interface Breadcrumb {
  icon?: FunctionalComponent;
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
