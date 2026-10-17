<template>
  <BaseContainer>
    <BaseSectionHeading heading="Edit Study" />
    <BaseSettingsSection heading="Study information">
      <template #description>
        Update <span class="font-semibold">{{ study?.name }}</span> study information here.
      </template>
      <template #form>
        <form @submit.prevent="onSubmit">
          <FieldGroup>
            <Field>
              <FieldLabel for="study-name">Name</FieldLabel>
              <Input id="study-name" name="name" spellcheck="false" v-model="studyFormData.name" />
            </Field>
            <Field>
              <FieldLabel for="study-description">Description</FieldLabel>
              <Textarea id="study-description" name="description" rows="3" v-model="studyFormData.description" />
            </Field>
            <div>
              <Button type="submit">Save</Button>
            </div>
          </FieldGroup>
        </form>
      </template>
    </BaseSettingsSection>
    <Separator class="my-8" />
    <BaseSettingsSection heading="Delete study">
      <template #description>
        This action is not reversible. All information related to the study
        <span class="font-semibold">{{ study?.name }}</span> will be deleted permanently, including chapters, lines and
        positions.
      </template>
      <template #form>
        <form class="flex items-start" @submit.prevent="deleteStudy">
          <Button type="submit" variant="destructive">Yes, delete this study</Button>
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
import { Insertable } from "kysely";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Studies } from "@/database";
import { EditableStudy } from "@/types";

const router = useRouter();
const route = useRoute("/studies/[studyId]/edit");

const query = db.selectFrom("studies").selectAll().where("id", "=", Number(route.params.studyId)).compile();
const study = ref<Insertable<Studies>>(await selectFirst(query));
const studyFormData = reactive<EditableStudy>({
  name: study.value.name,
  description: study.value.description ?? "",
});

async function onSubmit() {
  try {
    const query = db.updateTable("studies").set(studyFormData).where("id", "=", Number(route.params.studyId)).compile();
    const result = await execute(query);

    if (!result) return;
    toast.success("Study updated");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/UNIQUE constraint failed: studies\.name/i.test(message)) {
      toast.error("A study with this name already exists");
      return;
    }
    toast.error("Couldn't update study", {
      description: "Please try again.",
    });
  }
}

async function deleteStudy() {
  const query = db.deleteFrom("studies").where("id", "=", Number(route.params.studyId)).compile();
  await execute(query);
  toast.success(`Study ${study.value?.name} deleted`);
  router.push("/studies");
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
    name: study.value.name,
    to: `/studies/${study.value.id}`,
  },
  {
    name: "Edit",
    to: `/studies/${study.value.id}/edit`,
  },
]);
</script>
