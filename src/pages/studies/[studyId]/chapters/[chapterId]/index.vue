<template>
  <BaseContainer class="overflow-y-auto">
    <BaseSectionHeading heading="Lines">
      <template #actions>
        <BaseButton as="RouterLink" to="/studies/new">Create new line</BaseButton>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <LineList class="flex-grow mt-4" />
      <template #fallback>TODO LOADIN...</template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import LineList from "@components/lines/LineList.vue";
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
