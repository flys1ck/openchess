<template>
  <BaseContainer>
    <BaseSectionHeading heading="Studies">
      <template #actions>
        <BaseButton as="RouterLink" to="/studies/new" variant="primary">Create new study</BaseButton>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <StudyList />
      <template #fallback>
        <div class="space-y-4">
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
        </div>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import StudyList from "@components/studies/StudyList.vue";
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
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
    name: "Studies",
    to: "/studies/",
  },
]);
</script>
