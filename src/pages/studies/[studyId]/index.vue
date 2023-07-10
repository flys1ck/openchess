<template>
  <div class="flex flex-col flex-grow mx-4">
    <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-4">
      <h3 class="text-2xl font-semibold leading-6 text-gray-900">Chapters</h3>
      <div class="mt-3 sm:ml-4 sm:mt-0">
        <BaseButton as="RouterLink" :to="`/studies/${route.params.studyId}/chapters/new`"
          >Create new chapter</BaseButton
        >
      </div>
    </div>
    <Suspense>
      <ChapterList class="flex-grow" />
      <template #fallback> Loading ... </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import ChapterList from "@components/chapters/ChapterList.vue";
import { definePage, useRoute } from "vue-router/auto";

const route = useRoute("/studies/[studyId]/");

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
