<template>
  <ul class="space-y-2">
    <BaseCard v-for="line in lines" :key="line.id" as="li" class="relative p-4">
      <RouterLink
        class="font-medium"
        :to="`/studies/${route.params.studyId}/chapters/${route.params.chapterId}/lines/${line.id}`"
      >
        <span class="absolute inset-0" aria-hidden />
        {{ line.name }}</RouterLink
      >
      <p class="mt-2 text-sm text-gray-400">{{ line.moves }}</p>
    </BaseCard>
  </ul>
</template>

<script setup lang="ts">
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router/auto";
import BaseCard from "../base/BaseCard.vue";
import { db, select, selectFirst } from "@services/database";

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
  .orderBy("name")
  .compile();
const [chapter, lines] = await Promise.all([selectFirst(chapterQuery), select(lineQuery)]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
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
