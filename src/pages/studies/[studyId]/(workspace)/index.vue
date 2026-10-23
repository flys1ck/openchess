<template>
  <Empty v-if="isEmpty">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <BookOpen />
      </EmptyMedia>
      <template v-if="isImporting">
        <EmptyTitle>Importing lines…</EmptyTitle>
        <EmptyDescription>The first line opens here when the import finishes.</EmptyDescription>
      </template>
      <template v-else>
        <EmptyTitle>No lines yet</EmptyTitle>
        <EmptyDescription>Import a PGN to add chapters and lines to this study.</EmptyDescription>
      </template>
    </EmptyHeader>
    <EmptyContent v-if="!isImporting">
      <Button as-child>
        <RouterLink :to="`/studies/${route.params.studyId}/import`"
          ><FileUp data-icon="inline-start" />Import PGN</RouterLink
        >
      </Button>
    </EmptyContent>
  </Empty>
</template>

<script setup lang="ts">
import { navigationItems } from "@data/navigationItems";
import { BookOpen, FileUp } from "@lucide/vue";
import { db, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyImport } from "@stores/useStudyImport";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const route = useRoute("/studies/[studyId]/(workspace)/");
const router = useRouter();
const { setBreadcrumbs } = useBreadcrumbs();
const isEmpty = ref(false);
const studyImport = useStudyImport();
const isImporting = computed(() => studyImport.job?.studyId === Number(route.params.studyId));

watch(
  [() => route.params.studyId, isImporting],
  async ([studyId], _, onCleanup) => {
    let isStale = false;
    onCleanup(() => (isStale = true));
    isEmpty.value = false;
    const studyQuery = db.selectFrom("studies").select(["id", "name"]).where("id", "=", Number(studyId)).compile();
    const firstLineQuery = db
      .selectFrom("lines")
      .innerJoin("chapters", "chapters.id", "lines.chapter")
      .select(["lines.id", "lines.chapter"])
      .where("chapters.study", "=", Number(studyId))
      .orderBy("chapters.id")
      .orderBy("lines.id")
      .limit(1)
      .compile();
    const [study, firstLine] = await Promise.all([selectFirst(studyQuery), selectFirst(firstLineQuery)]);
    if (isStale) return;

    setBreadcrumbs([navigationItems.studies, { name: study?.name ?? "", to: `/studies/${studyId}` }]);
    if (!firstLine) {
      isEmpty.value = true;
      return;
    }
    router.replace({
      name: "/studies/[studyId]/(workspace)/chapters/[chapterId]/lines/[lineId]",
      params: { studyId, chapterId: firstLine.chapter, lineId: firstLine.id },
    });
  },
  { immediate: true }
);
</script>
