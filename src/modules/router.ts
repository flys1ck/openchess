import { useSession } from "@stores/useSession";
import { setupLayouts } from "virtual:generated-layouts";
import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router/auto";

declare module "vue-router" {
  interface RouteMeta {
    breadcrumb?: string;
  }
}

// @see https://github.com/posva/unplugin-vue-router/issues/121
function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (!route.children) return setupLayouts([route])[0];

  for (let i = 0; i < route.children.length; i++) {
    route.children[i] = recursiveLayouts(route.children[i]);
  }
  return route;
}

const router = createRouter({
  history: createWebHistory(),
  extendRoutes(routes) {
    return routes.map(recursiveLayouts);
  },
});

router.beforeEach((to) => {
  const publicRoutes = ["/signin", "/signup"];
  const { session } = useSession();

  if (to.name && session === null && !publicRoutes.includes(to.name as string)) return { name: "/signin" };
});

export default router;
