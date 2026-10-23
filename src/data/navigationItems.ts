import { BookOpen, ChessKnight, Settings, Swords } from "@lucide/vue";
import { Component } from "vue";
import { RouteNamedMap } from "vue-router/auto-routes";

export interface NavigationItem {
  icon: Component;
  name: string;
  to: keyof RouteNamedMap;
}

export const navigationItems = {
  analysis: {
    icon: ChessKnight,
    name: "Analysis",
    to: "/analysis/",
  },
  studies: {
    icon: BookOpen,
    name: "Studies",
    to: "/studies/",
  },
  games: {
    icon: Swords,
    name: "Games",
    to: "/games/",
  },
  settings: {
    icon: Settings,
    name: "Settings",
    to: "/settings/",
  },
} satisfies Record<string, NavigationItem>;
