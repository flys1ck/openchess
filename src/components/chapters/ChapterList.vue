<template>
  <ul>
    <li v-for="chapter in chapters" :key="chapter.id">
      <Button variant="link" class="px-0" as-child>
        <RouterLink :to="`/studies/${route.params.studyId}/chapters/${chapter.id}`">{{ chapter.name }}</RouterLink>
      </Button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { GraduationCap } from "@lucide/vue";
import { db, select, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";

// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/");
// TODO: move studyId to props

const studyQuery = db
  .selectFrom("studies")
  .select(["id", "name"])
  .where("id", "=", Number(route.params.studyId))
  .compile();
const chapterQuery = db
  .selectFrom("chapters")
  .selectAll()
  .where("study", "=", Number(route.params.studyId))
  .orderBy("created_at")
  .compile();

const [study, chapters] = await Promise.all([selectFirst(studyQuery), select(chapterQuery)]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: GraduationCap,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: study?.name ?? "",
    to: `/studies/${study?.id}`,
  },
]);
</script>
