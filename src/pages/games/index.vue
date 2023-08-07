<template>
  <ul class="grid grid-cols-2 md:grid-cols-3 gap-8 my-4 max-w-5xl mx-auto">
    <BaseCard v-for="platform in platforms" :key="platform.title" as="li" class="p-6 relative">
      <div>
        <img class="aspect-square rounded" :src="platform.imgSrc" :alt="platform.imgAlt" />
      </div>
      <div>
        <h3 class="text-lg mt-4 font-semibold leading-6 text-gray-900">
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
import OTBClockThumbnail from "@assets/images/otb_clock.png";
import OTBThumbnail from "@assets/images/otb.png";
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
    imgAlt: "Woman and man sitting at  table in cafe palying chess.",
  },
  {
    title: "Over the board (Coming soon!)",
    to: "#",
    imgSrc: OTBClockThumbnail,
    imgAlt: "Chess clock in front of three chess pieces, two queens and one king.",
  },
];
</script>
