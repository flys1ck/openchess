import { setupLayouts } from "virtual:generated-layouts";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
import { routes, handleHotUpdate } from "vue-router/auto-routes";

declare module "vue-router" {
  interface RouteMeta {
    breadcrumb?: string;
  }
}

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (!route.children) return setupLayouts([route])[0];

  for (let i = 0; i < route.children.length; i++) {
    route.children[i] = recursiveLayouts(route.children[i]);
  }
  return route;
}

const router = createRouter({
  history: createWebHistory(),
  routes: routes.map(recursiveLayouts),
});

if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
