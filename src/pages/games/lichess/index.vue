<template>
  <div class="mx-auto max-w-5xl">
    <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-4">
      <h3 class="text-2xl font-semibold leading-6 text-gray-900">Games on Lichess</h3>
      <div class="mt-3 sm:ml-4 sm:mt-0">
        <BaseButton variant="secondary" :prefix-icon="ArrowPathIcon" @click="lichessGameList?.refresh"
          >Refresh</BaseButton
        >
      </div>
    </div>
    <Suspense>
      <LichessGameList ref="lichessGameList" class="my-4" />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import LichessGameList from "@components/games/LichessGameList.vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { Component, ref } from "vue";
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

const lichessGameList = ref<InstanceType<typeof LichessGameList>>();
</script>
