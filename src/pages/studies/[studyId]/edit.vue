<template>
  <BaseContainer>
    <BaseSectionHeading heading="Edit Study" />
    <BaseSettingsSection heading="Study information">
      <template #description>
        Update <span class="font-semibold">{{ study?.name }}</span> study information here.
      </template>
      <template #form>
        <form @submit.prevent="onSubmit">
          <BaseInputGroup class="mt-2" label="Name" v-model="studyFormData.name" />
          <div class="mt-4">
            <BaseInputLabel html-for="description">Description</BaseInputLabel>
            <div class="mt-2">
              <BaseTextarea id="description" name="about" rows="3" v-model="studyFormData.description"></BaseTextarea>
            </div>
          </div>
          <div class="mt-8">
            <BaseButton type="submit">Save</BaseButton>
          </div>
        </form>
      </template>
    </BaseSettingsSection>
    <hr class="my-8" />
    <BaseSettingsSection heading="Delete study">
      <template #description>
        This action is not reversible. All information related to the study
        <span class="font-semibold">{{ study?.name }}</span> will be deleted permanently, including chapters, lines and
        positions.
      </template>
      <template #form>
        <form class="flex items-start" @submit.prevent="deleteStudy">
          <BaseButton type="submit" variant="danger">Yes, delete this study</BaseButton>
        </form>
      </template>
    </BaseSettingsSection>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@/components/base/BaseButton.vue";
import BaseContainer from "@/components/base/BaseContainer.vue";
import BaseInputGroup from "@/components/base/BaseInputGroup.vue";
import BaseInputLabel from "@/components/base/BaseInputLabel.vue";
import BaseSectionHeading from "@/components/base/BaseSectionHeading.vue";
import BaseSettingsSection from "@/components/base/BaseSettingsSection.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import { Studies } from "@/database";
import { db, execute, selectFirst } from "@/services/database";
import { useBreadcrumbs } from "@/stores/useBreadcrumbs";
import { useToasts } from "@/stores/useToasts";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { Insertable } from "kysely";
import { reactive, ref } from "vue";
import { useRoute, useRouter, definePage } from "vue-router/auto";

const router = useRouter();
const route = useRoute("/studies/[studyId]/edit");

const query = db.selectFrom("studies").selectAll().where("id", "=", Number(route.params.studyId)).compile();
const study = ref<Insertable<Studies>>(await selectFirst(query));
const studyFormData = reactive<Insertable<Studies>>({
  name: study.value.name,
  description: study.value.description,
});

const { addToast } = useToasts();
async function onSubmit() {
  // TODO check all requests for constraint failure
  const query = db.updateTable("studies").set(studyFormData).where("id", "=", Number(route.params.studyId)).compile();
  const result = await execute(query);

  if (!result) return;
  addToast({ heading: `Study updated` });
}

async function deleteStudy() {
  const query = db.deleteFrom("studies").where("id", "=", Number(route.params.studyId)).compile();
  await execute(query);
  addToast({ heading: `Study ${study.value?.name} deleted` });
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
    icon: AcademicCapIcon,
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
