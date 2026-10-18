<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Study" />
    <form @submit.prevent="onSubmit">
      <FieldGroup class="border-b pb-12">
        <Field :data-invalid="!!nameError">
          <FieldLabel for="study-name">Name</FieldLabel>
          <Input
            id="study-name"
            name="name"
            spellcheck="false"
            :aria-invalid="!!nameError"
            v-model="studyFormData.name"
          />
          <FieldError v-if="nameError">{{ nameError }}</FieldError>
        </Field>
        <Field>
          <FieldLabel for="study-description">Description</FieldLabel>
          <Textarea id="study-description" name="description" rows="3" v-model="studyFormData.description" />
        </Field>
      </FieldGroup>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outline" @click="$router.push('/studies')">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import { GraduationCap } from "@lucide/vue";
import { db, execute, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditableStudy } from "@/types";

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
    name: "New Study",
    to: "/studies/new",
  },
]);

const router = useRouter();
const studyFormData = reactive<EditableStudy>({
  name: "",
  description: "",
});
const nameError = ref<string>();

async function onSubmit() {
  const name = studyFormData.name.trim();
  nameError.value = name ? undefined : "Name is required";
  if (nameError.value) return;

  try {
    const existingStudy = await selectFirst(db.selectFrom("studies").select("id").where("name", "=", name).compile());
    nameError.value = existingStudy ? "A study with this name already exists" : undefined;
    if (nameError.value) return;

    const query = db
      .insertInto("studies")
      .values({ ...studyFormData, name })
      .compile();
    const result = await execute(query);

    if (!result) return;
    toast.success(`Study ${name} created`);
    router.push(`/studies/${result.lastInsertId}`);
  } catch {
    toast.error("Couldn't create study", {
      description: "Please try again.",
    });
  }
}
</script>
