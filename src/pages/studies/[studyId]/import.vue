<template>
  <BaseContainer>
    <BaseSectionHeading heading="Import PGN" />
    <form @submit.prevent="onSubmit">
      <FieldGroup>
        <StudyImportFields
          v-model:files="files"
          v-model:settings="settings"
          :headers="headers"
          :plan="plan"
          :existing-lines="existingLines"
        />
      </FieldGroup>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outline" as-child>
          <RouterLink :to="`/studies/${study.id}`">Cancel</RouterLink>
        </Button>
        <Button type="submit" :disabled="!lineCount || !!studyImport.job">Import</Button>
      </div>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import StudyImportFields from "@components/studies/StudyImportFields.vue";
import { useStudyImportPlan } from "@composables/useStudyImportPlan";
import { GraduationCap } from "@lucide/vue";
import { db, select, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useStudyImport } from "@stores/useStudyImport";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

const route = useRoute("/studies/[studyId]/import");
const router = useRouter();
const studyImport = useStudyImport();
const { files, settings, headers, plan, lineCount } = useStudyImportPlan();

const studyId = Number(route.params.studyId);
const [study, existingRows] = await Promise.all([
  selectFirst(db.selectFrom("studies").select(["id", "name"]).where("id", "=", studyId).compile()),
  select(
    db
      .selectFrom("chapters")
      .leftJoin("lines", "lines.chapter", "chapters.id")
      .select(["chapters.name as chapterName", "lines.name as lineName"])
      .where("chapters.study", "=", studyId)
      .compile()
  ),
]);

const existingLines = new Map<string, Set<string>>();
for (const { chapterName, lineName } of existingRows) {
  const lineNames = existingLines.get(chapterName) ?? new Set();
  if (lineName !== null) lineNames.add(lineName);
  existingLines.set(chapterName, lineNames);
}

async function onSubmit() {
  if (!plan.value) return;
  studyImport.start({ type: "existingStudy", id: study.id }, plan.value, study.name);
  await router.push(`/studies/${study.id}`);
}

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
  {
    name: study.name,
    to: `/studies/${study.id}`,
  },
  {
    name: "Import PGN",
    to: `/studies/${study.id}/import`,
  },
]);
</script>
