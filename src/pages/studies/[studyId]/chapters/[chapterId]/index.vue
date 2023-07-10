<template>
  <div class="flex flex-col flex-grow mx-4">
    <div class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between mt-4">
      <h3 class="text-2xl font-semibold leading-6 text-gray-900">Lines</h3>
      <div class="mt-3 sm:ml-4 sm:mt-0">
        <BaseButton as="RouterLink" to="/studies/new">Create new line</BaseButton>
      </div>
    </div>
    <Suspense>
      <LineList class="flex-grow mt-4" />
      <template #fallback> TODO LOADIN... </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import LineList from "@components/lines/LineList.vue";
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
