<template>
  <BaseContainer>
    <BaseSectionHeading heading="Studies">
      <template #actions>
        <Button as-child>
          <RouterLink to="/studies/new">Create new study</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <Card v-if="isCreatingStudy" class="mb-4 gap-3 p-6">
      <p class="text-sm leading-6 font-semibold">{{ studyImport.job?.studyName }}</p>
      <StudyImportProgress class="max-w-sm" />
    </Card>
    <Suspense>
      <StudyList :key="studyListKey" />
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
import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import StudyList from "@components/studies/StudyList.vue";
import { GraduationCap } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyImport } from "@stores/useStudyImport";
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const studyImport = useStudyImport();
const isCreatingStudy = computed(() => !!studyImport.job && studyImport.job.studyId === undefined);
const studyListKey = ref(0);
watch(isCreatingStudy, (creating) => {
  if (!creating) studyListKey.value++;
});

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
