<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Chapters" />
    <form @submit.prevent="onSubmit">
      <FieldGroup>
        <Field>
          <FieldLabel for="chapter-name">Chapter Header</FieldLabel>
          <NativeSelect id="chapter-name" v-model="chapterHeader">
            <NativeSelectOption value="White">White</NativeSelectOption>
            <NativeSelectOption value="Black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="line-name">Line Header</FieldLabel>
          <NativeSelect id="line-name" v-model="lineHeader">
            <NativeSelectOption value="">Leave blank</NativeSelectOption>
            <NativeSelectOption value="White">White</NativeSelectOption>
            <NativeSelectOption value="Black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="line-orientation">Line Orientation</FieldLabel>
          <NativeSelect id="line-orientation" v-model="lineOrientation">
            <NativeSelectOption value="white">White</NativeSelectOption>
            <NativeSelectOption value="black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="file-upload">PGNs</FieldLabel>
          <BaseFileUpload v-model="files" :multiple="true" accept=".pgn" />
        </Field>
        <div class="mt-4">
          <Button type="submit" :disabled="progress !== undefined">
            {{ progress ? `Importing ${progress.importedLines} / ${progress.totalLines}` : "Upload" }}
          </Button>
        </div>
      </FieldGroup>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import { GraduationCap } from "@lucide/vue";
import { db, selectFirst } from "@services/database";
import { ImportProgress, importStudy } from "@services/studyImport";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { Orientation, buildImportPlan } from "@utilities/studyImport";
import { parsePgn } from "chessops/pgn";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

const route = useRoute("/studies/[studyId]/chapters/new");
const router = useRouter();
const files = ref<File[]>([]);
const chapterHeader = ref("White");
const lineHeader = ref("Black");
const lineOrientation = ref<Orientation>("white");
const progress = ref<ImportProgress>();

const query = db.selectFrom("studies").select(["id", "name"]).where("id", "=", Number(route.params.studyId)).compile();
const study = await selectFirst(query);

async function onSubmit() {
  const pgns = await Promise.all(files.value.map((file) => file.text()));
  const plan = buildImportPlan(
    pgns.flatMap((pgn) => parsePgn(pgn)),
    {
      chapterHeader: chapterHeader.value,
      lineHeader: lineHeader.value,
      orientation: lineOrientation.value,
    }
  );
  progress.value = { importedLines: 0, totalLines: 0 };
  try {
    await importStudy({ type: "existingStudy", id: study.id }, plan, (update) => (progress.value = update));
    await router.push(`/studies/${study.id}`);
  } catch (error) {
    toast.error("Import failed", { description: String(error) });
  } finally {
    progress.value = undefined;
  }
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
    to: `/studies/${route.params.studyId}`,
  },
  {
    name: "New Chapters",
    to: `/studies/${route.params.studyId}/chapters/new`,
  },
]);
</script>
