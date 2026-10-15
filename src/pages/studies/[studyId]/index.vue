<template>
  <BaseContainer>
    <BaseSectionHeading heading="Studies">
      <template #actions>
        <Button variant="outline" as-child>
          <RouterLink :to="`/studies/${route.params.studyId}/edit`">Edit study</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <BaseSectionHeading heading="Chapters">
      <template #actions>
        <Button as-child>
          <RouterLink :to="`/studies/${route.params.studyId}/chapters/new`">Create new chapter</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <ChapterList class="grow" />
      <template #fallback> Loading ... </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChapterList from "@components/chapters/ChapterList.vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";

const route = useRoute("/studies/[studyId]/");

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
