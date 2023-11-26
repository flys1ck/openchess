<template>
  <ul class="mx-auto my-4 grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-3">
    <BaseCard v-for="platform in platforms" :key="platform.title" as="li" class="relative p-6">
      <div>
        <img class="aspect-square rounded" :src="platform.imgSrc" :alt="platform.imgAlt" />
      </div>
      <div>
        <h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900">
          <RouterLink :to="platform.to" class="focus:outline-none">
            <!-- Extend touch target to entire panel -->
            <span class="absolute inset-0" aria-hidden="true" />
            {{ platform.title }}
          </RouterLink>
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at blanditiis et quo
          et molestiae.
        </p>
      </div>
    </BaseCard>
  </ul>
</template>

<script setup lang="ts">
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage } from "vue-router/auto";
import OTBThumbnail from "@assets/images/otb.png";
import ChessDotComThumbnail from "@assets/images/chessdotcom.png";
import BaseCard from "@components/base/BaseCard.vue";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Games",
    to: "/games/",
  },
]);

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
