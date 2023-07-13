import { defineStore } from "pinia";
import { ref, type FunctionalComponent } from "vue";
import type { RouteNamedMap } from "vue-router/auto/routes";

interface Breadcrumb {
  icon?: FunctionalComponent;
  name: string;
  to: keyof RouteNamedMap | string;
}

export const useBreadcrumbs = defineStore("breadcrumbs", () => {
  const breadcrumbs = ref<Breadcrumb[]>([]);

  function setBreadcrumbs(crumbs: Breadcrumb[]) {
    breadcrumbs.value = crumbs;
  }

  return { breadcrumbs, setBreadcrumbs };
});
