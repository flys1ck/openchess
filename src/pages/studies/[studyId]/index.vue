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
        <Button v-if="studyImport.job" disabled>Import PGN</Button>
        <Button v-else as-child>
          <RouterLink :to="`/studies/${route.params.studyId}/import`">Import PGN</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <div v-if="isImporting" class="mb-6 flex max-w-sm flex-col gap-2">
      <p class="text-sm font-medium">Importing lines…</p>
      <StudyImportProgress />
    </div>
    <Suspense>
      <ChapterList :key="chapterListKey" class="grow" />
      <template #fallback>
        <ul class="grow space-y-3">
          <li v-for="index in 5" :key="index">
            <Skeleton class="h-5 w-40" />
          </li>
        </ul>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChapterList from "@components/chapters/ChapterList.vue";
import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import { useStudyImport } from "@stores/useStudyImport";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const route = useRoute("/studies/[studyId]/");
const studyImport = useStudyImport();
const isImporting = computed(() => studyImport.job?.studyId === Number(route.params.studyId));
const chapterListKey = ref(0);
watch(isImporting, (importing) => {
  if (!importing) chapterListKey.value++;
});

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
