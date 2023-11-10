<template>
  <BaseContainer>
    <BaseSectionHeading heading="Studies">
      <template #actions>
        <BaseButton as="RouterLink" :to="`/studies/${route.params.studyId}/edit`" variant="secondary"
          >Edit study</BaseButton
        >
      </template>
    </BaseSectionHeading>
    <BaseSectionHeading heading="Chapters">
      <template #actions>
        <BaseButton as="RouterLink" :to="`/studies/${route.params.studyId}/chapters/new`"
          >Create new chapter</BaseButton
        >
      </template>
    </BaseSectionHeading>
    <Suspense>
      <ChapterList class="flex-grow" />
      <template #fallback> Loading ... </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChapterList from "@components/chapters/ChapterList.vue";
import { definePage, useRoute } from "vue-router/auto";

const route = useRoute("/studies/[studyId]/");

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
