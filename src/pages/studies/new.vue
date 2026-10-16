<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Study" />
    <form @submit.prevent="onSubmit">
      <FieldGroup class="border-b pb-12">
        <Field>
          <FieldLabel for="study-name">Name</FieldLabel>
          <Input id="study-name" name="name" spellcheck="false" v-model="studyFormData.name" />
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
import { db, execute } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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

async function onSubmit() {
  try {
    const query = db.insertInto("studies").values(studyFormData).compile();
    const result = await execute(query);

    if (!result) return;
    toast.success(`Study ${studyFormData.name} created`);
    router.push(`/studies/${result.lastInsertId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/UNIQUE constraint failed: studies\.name/i.test(message)) {
      toast.error("A study with this name already exists");
      return;
    }
    toast.error("Failed to create study", {
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
</script>
