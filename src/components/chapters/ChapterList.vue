<template>
  <ul>
    <li v-for="chapter in chapters" :key="chapter.id">
      <BaseLink :to="`/studies/${route.params.studyId}/chapters/${chapter.id}`">{{ chapter.name }}</BaseLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router/auto";
import BaseLink from "../base/BaseLink.vue";
import { db, select, selectFirst } from "@services/database";

// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/");
// TODO: move studyId to props

const studyQuery = db
  .selectFrom("studies")
  .select(["id", "name"])
  .where("id", "=", Number(route.params.studyId))
  .compile();
const chapterQuery = db.selectFrom("chapters").selectAll().where("study", "=", Number(route.params.studyId)).compile();
const [study, chapters] = await Promise.all([selectFirst(studyQuery), select(chapterQuery)]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: study?.name ?? "",
    to: `/studies/${study?.id}`,
  },
]);
</script>
