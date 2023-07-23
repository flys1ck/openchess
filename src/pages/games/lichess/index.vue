<template>
  <Suspense>
    <LichessGameList />
  </Suspense>
</template>

<script setup lang="ts">
import LichessGameList from "@components/games/LichessGameList.vue";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage } from "vue-router/auto";

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
  {
    name: "Lichess",
    to: "/games/lichess/",
  },
]);
</script>
