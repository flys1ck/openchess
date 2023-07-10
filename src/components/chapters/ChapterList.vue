<template>
  <ul>
    <li v-for="chapter in chapters" :key="chapter.id">
      <BaseLink :to="`/studies/${route.params.studyId}/chapters/${chapter.id}`">{{ chapter.name }}</BaseLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useSupabase } from "@composables/useSupabase";
import { useRoute } from "vue-router/auto";
import BaseLink from "../base/BaseLink.vue";

const supabase = useSupabase();
// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/");

const { data: chapters } = await supabase.from("chapters").select("*").eq("study", route.params.studyId);
</script>
