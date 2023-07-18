<template>
  <ul>
    <li v-for="chapter in chapters" :key="chapter.id">
      <BaseLink :to="`/studies/${route.params.studyId}/chapters/${chapter.id}`">{{ chapter.name }}</BaseLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useSupabase } from "@composables/useSupabase";
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router/auto";
import BaseLink from "../base/BaseLink.vue";

const supabase = useSupabase();
// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/");

// TODO: move studyId to props
const [{ data: study }, { data: chapters }] = await Promise.all([
  supabase.from("studies").select("id, name").eq("id", route.params.studyId).single(),
  await supabase.from("chapters").select("*").eq("study", route.params.studyId).order("name"),
]);

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: study?.name ?? "",
    to: `/studies/${study?.id}`,
  },
]);
</script>
