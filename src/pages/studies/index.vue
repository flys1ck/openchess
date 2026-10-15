<template>
  <BaseContainer>
    <BaseSectionHeading heading="Studies">
      <template #actions>
        <Button as-child>
          <RouterLink to="/studies/new">Create new study</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <StudyList />
      <template #fallback>
        <div class="space-y-4">
          <StudyCardSkeleton v-for="index in 5" :key="index" />
        </div>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import StudyList from "@components/studies/StudyList.vue";
import { GraduationCap } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { Button } from "@/components/ui/button";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: GraduationCap,
    name: "Studies",
    to: "/studies/",
  },
]);
</script>
