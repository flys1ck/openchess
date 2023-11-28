<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Study" />
    <form @submit.prevent="onSubmit">
      <div class="space-y-12">
        <div class="border-b border-gray-900/10 pb-12">
          <BaseInputGroup class="mt-2" label="Name" v-model="studyFormData.name" />
          <div class="mt-2">
            <div class="col-span-full">
              <label for="about" class="block text-sm font-medium leading-6 text-gray-900">Description</label>
              <div class="mt-2">
                <BaseTextarea id="about" name="about" rows="3" v-model="studyFormData.description"></BaseTextarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 flex items-center justify-end gap-x-6">
        <BaseButton variant="secondary" @click="$router.push('/studies')">Cancel</BaseButton>
        <BaseButton type="submit">Save</BaseButton>
      </div>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import { EditableStudy } from "@/types";
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseInputGroup from "@components/base/BaseInputGroup.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import BaseTextarea from "@components/base/BaseTextarea.vue";
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { db, execute } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useToasts } from "@stores/useToasts";
import { reactive } from "vue";
import { definePage, useRouter } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
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

const { addToast } = useToasts();
async function onSubmit() {
  // TODO check all requests for constraint failure
  const query = db.insertInto("studies").values(studyFormData).compile();
  const result = await execute(query);

  if (!result) return;
  addToast({ heading: `Study ${studyFormData.name} created` });
  router.push(`/studies/${result.lastInsertId}`);
}
</script>
