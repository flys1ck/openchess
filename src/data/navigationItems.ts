import { AcademicCapIcon, BeakerIcon, Cog8ToothIcon, TrophyIcon } from "@heroicons/vue/24/outline";

import { FunctionalComponent } from "vue";
import { RouteNamedMap } from "vue-router/auto/routes";

export interface NavigationItem {
  icon: FunctionalComponent;
  text: string;
  to: keyof RouteNamedMap;
}

export const navigationItems: NavigationItem[] = [
  {
    icon: BeakerIcon,
    text: "Analysis",
    to: "/analysis/",
  },
  {
    icon: AcademicCapIcon,
    text: "Studies",
    to: "/studies/",
  },
  {
    icon: TrophyIcon,
    text: "Games",
    to: "/games/",
  },
  {
    icon: Cog8ToothIcon,
    text: "Settings",
    to: "/settings/",
  },
];
