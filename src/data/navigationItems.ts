import { FlaskConical, GraduationCap, Settings, Trophy } from "@lucide/vue";
import { Component } from "vue";
import { RouteNamedMap } from "vue-router/auto-routes";

export interface NavigationItem {
  icon: Component;
  text: string;
  to: keyof RouteNamedMap;
}

export const navigationItems: NavigationItem[] = [
  {
    icon: FlaskConical,
    text: "Analysis",
    to: "/analysis/",
  },
  {
    icon: GraduationCap,
    text: "Studies",
    to: "/studies/",
  },
  {
    icon: Trophy,
    text: "Games",
    to: "/games/",
  },
  {
    icon: Settings,
    text: "Settings",
    to: "/settings/",
  },
];
