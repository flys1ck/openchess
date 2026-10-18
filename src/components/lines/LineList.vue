<template>
  <ul class="space-y-2">
    <li v-for="line in lines" :key="line.id">
      <Card class="hover:bg-muted/50 relative gap-2 p-4 transition-colors">
        <RouterLink
          class="font-medium"
          :to="`/studies/${route.params.studyId}/chapters/${route.params.chapterId}/lines/${line.id}`"
        >
          <span class="absolute inset-0" aria-hidden />
          {{ line.name }}</RouterLink
        >
        <p class="text-muted-foreground text-sm">{{ line.moves }}</p>
      </Card>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { GraduationCap } from "@lucide/vue";
import { db, select, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router";
import { Card } from "@/components/ui/card";

// TODO: move route param to chapter (props)
const route = useRoute("/studies/[studyId]/chapters/[chapterId]/");

const chapterQuery = db
  .selectFrom("chapters")
  .innerJoin("studies", "studies.id", "chapters.study")
  .select(["chapters.id", "chapters.name", "studies.id as study_id", "studies.name as study_name"])
  .where("chapters.id", "=", Number(route.params.chapterId))
  .compile();

const lineQuery = db
  .selectFrom("lines")
  .selectAll()
  .where("chapter", "=", Number(route.params.chapterId))
  .orderBy("id")
  .compile();
const [chapter, lines] = await Promise.all([selectFirst(chapterQuery), select(lineQuery)]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: GraduationCap,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: chapter.study_name,
    to: `/studies/${chapter.study_id}`,
  },
  {
    name: chapter.name,
    to: `/studies/${chapter.study_id}/chapters/${chapter.id}`,
  },
]);
</script>
