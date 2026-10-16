<template>
  <BaseContainer class="overflow-y-auto">
    <BaseSectionHeading heading="Lines">
      <template #actions>
        <Button as-child>
          <RouterLink to="/studies/new">Create new line</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <LineList class="mt-4 grow" />
      <template #fallback>
        <div class="mt-4 space-y-4">
          <StudyCardSkeleton v-for="index in 5" :key="index" />
        </div>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import LineList from "@components/lines/LineList.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import { Button } from "@/components/ui/button";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
