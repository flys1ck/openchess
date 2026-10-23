<template>
  <Empty v-if="isEmpty">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <BookOpen />
      </EmptyMedia>
      <EmptyTitle>No lines in this chapter</EmptyTitle>
      <EmptyDescription
        >Import a PGN into this study to add lines, or pick a line from another chapter.</EmptyDescription
      >
    </EmptyHeader>
  </Empty>
</template>

<script setup lang="ts">
import { navigationItems } from "@data/navigationItems";
import { BookOpen } from "@lucide/vue";
import { db, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const route = useRoute("/studies/[studyId]/(workspace)/chapters/[chapterId]/");
const router = useRouter();
const { setBreadcrumbs } = useBreadcrumbs();
const isEmpty = ref(false);

watch(
  () => route.params.chapterId,
  async (chapterId, _, onCleanup) => {
    let isStale = false;
    onCleanup(() => (isStale = true));
    isEmpty.value = false;
    const chapterQuery = db
      .selectFrom("chapters")
      .innerJoin("studies", "studies.id", "chapters.study")
      .select(["chapters.id", "chapters.name", "studies.id as study_id", "studies.name as study_name"])
      .where("chapters.id", "=", Number(chapterId))
      .compile();
    const firstLineQuery = db
      .selectFrom("lines")
      .select("id")
      .where("chapter", "=", Number(chapterId))
      .orderBy("id")
      .limit(1)
      .compile();
    const [chapter, firstLine] = await Promise.all([selectFirst(chapterQuery), selectFirst(firstLineQuery)]);
    if (isStale) return;

    if (chapter) {
      setBreadcrumbs([
        navigationItems.studies,
        { name: chapter.study_name, to: `/studies/${chapter.study_id}` },
        { name: chapter.name, to: `/studies/${chapter.study_id}/chapters/${chapter.id}` },
      ]);
    }
    if (!firstLine) {
      isEmpty.value = true;
      return;
    }
    router.replace({
      name: "/studies/[studyId]/(workspace)/chapters/[chapterId]/lines/[lineId]",
      params: { studyId: route.params.studyId, chapterId, lineId: firstLine.id },
    });
  },
  { immediate: true }
);
</script>
