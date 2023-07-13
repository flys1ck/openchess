<template>
  <ul class="space-y-2">
    <BaseCard v-for="line in lines" :key="line.id" as="li" class="relative">
      <RouterLink
        class="font-medium"
        :to="`/studies/${route.params.studyId}/chapters/${route.params.chapterId}/lines/${line.id}`"
      >
        <span class="absolute inset-0" aria-hidden />
        {{ line.name }}</RouterLink
      >
      <p class="text-gray-400 text-sm mt-2">{{ line.moves }}</p>
    </BaseCard>
  </ul>
</template>

<script setup lang="ts">
import { useSupabase } from "@composables/useSupabase";
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router/auto";
import BaseCard from "../base/BaseCard.vue";

const supabase = useSupabase();
// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/chapters/[chapterId]/");

const [{ data: chapter }, { data: lines }] = await Promise.all([
  supabase.from("chapters").select("id, name, studies ( id, name )").eq("id", route.params.chapterId).single(),
  supabase.from("lines").select("*").eq("chapter", route.params.chapterId).order("name"),
]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: chapter?.studies?.name ?? "",
    to: `/studies/${chapter?.studies?.id}`,
  },
  {
    name: chapter?.name ?? "",
    to: `/studies/${chapter?.studies?.id}/chapters/${chapter?.id}`,
  },
]);
</script>
