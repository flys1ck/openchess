<template>
  <ul class="mx-auto my-4 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3">
    <li v-for="platform in platforms" :key="platform.title">
      <Card class="hover:bg-muted/50 relative h-full gap-0 p-6 transition-colors has-focus-visible:ring-3">
        <div>
          <img class="aspect-square rounded-sm" :src="platform.imgSrc" :alt="platform.imgAlt" />
        </div>
        <div>
          <h3 class="mt-4 text-lg leading-6 font-semibold">
            <RouterLink :to="platform.to" class="focus:outline-hidden">
              <!-- Extend touch target to entire panel -->
              <span class="absolute inset-0" aria-hidden="true" />
              {{ platform.title }}
            </RouterLink>
          </h3>
          <p class="text-muted-foreground mt-2 text-sm">
            Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at blanditiis et
            quo et molestiae.
          </p>
        </div>
      </Card>
    </li>
  </ul>
</template>

<script setup lang="ts">
import ChessDotComThumbnail from "@assets/images/chessdotcom.png";
import OTBThumbnail from "@assets/images/otb.png";
import { navigationItems } from "@data/navigationItems";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { Card } from "@/components/ui/card";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([navigationItems.games]);

const platforms = [
  {
    title: "Lichess",
    to: "/games/lichess",
    imgSrc: OTBThumbnail,
    imgAlt: "Woman and man sitting at table in cafe palying chess.",
  },
  {
    title: "Chess.com",
    to: "/games/chessdotcom",
    imgSrc: ChessDotComThumbnail,
    imgAlt: "Woman and man sitting at table in cafe palying chess.",
  },
];
</script>
