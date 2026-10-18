<template>
  <BaseContainer>
    <BaseSectionHeading heading="Edit Chapter" />
    <BaseSettingsSection heading="Chapter information">
      <template #description>
        Update <span class="font-semibold">{{ chapterName }}</span> chapter information here.
      </template>
      <template #form>
        <form @submit.prevent="onSubmit">
          <FieldGroup>
            <Field :data-invalid="!!nameError">
              <FieldLabel for="chapter-name">Name</FieldLabel>
              <Input id="chapter-name" name="name" spellcheck="false" :aria-invalid="!!nameError" v-model="name" />
              <FieldError v-if="nameError">{{ nameError }}</FieldError>
            </Field>
            <div>
              <Button type="submit">Save</Button>
            </div>
          </FieldGroup>
        </form>
      </template>
    </BaseSettingsSection>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import { GraduationCap } from "@lucide/vue";
import { db, execute, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const route = useRoute("/studies/[studyId]/chapters/[chapterId]/edit");
const chapterId = Number(route.params.chapterId);

const chapter = await selectFirst(
  db
    .selectFrom("chapters")
    .innerJoin("studies", "studies.id", "chapters.study")
    .select(["chapters.id", "chapters.name", "studies.id as study_id", "studies.name as study_name"])
    .where("chapters.id", "=", chapterId)
    .compile()
);
const chapterName = ref(chapter.name);
const name = ref(chapter.name);
const nameError = ref<string>();

async function onSubmit() {
  const trimmedName = name.value.trim();
  nameError.value = trimmedName ? undefined : "Name is required";
  if (nameError.value) return;

  try {
    const existingChapter = await selectFirst(
      db
        .selectFrom("chapters")
        .select("id")
        .where("study", "=", chapter.study_id)
        .where("name", "=", trimmedName)
        .where("id", "!=", chapterId)
        .compile()
    );
    nameError.value = existingChapter ? "A chapter with this name already exists in this study" : undefined;
    if (nameError.value) return;

    const result = await execute(
      db.updateTable("chapters").set({ name: trimmedName }).where("id", "=", chapterId).compile()
    );
    if (!result) return;

    name.value = trimmedName;
    chapterName.value = trimmedName;
    updateBreadcrumbs();
    toast.success("Chapter updated");
  } catch {
    toast.error("Couldn't update chapter", {
      description: "Please try again.",
    });
  }
}

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
function updateBreadcrumbs() {
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
      name: chapterName.value,
      to: `/studies/${chapter.study_id}/chapters/${chapter.id}`,
    },
    {
      name: "Edit",
      to: `/studies/${chapter.study_id}/chapters/${chapter.id}/edit`,
    },
  ]);
}
updateBreadcrumbs();
</script>
