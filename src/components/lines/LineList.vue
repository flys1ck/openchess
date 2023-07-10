<template>
  <ul class="space-y-2">
    <BaseCard v-for="line in lines" :key="line.id" as="li">
      <RouterLink
        class="font-medium"
        :to="`/studies/${route.params.studyId}/chapters/${route.params.chapterId}/lines/${line.id}`"
        >{{ line.name }}</RouterLink
      >
      <p class="text-gray-400 text-sm mt-2">{{ line.moves }}</p>
    </BaseCard>
  </ul>
</template>

<script setup lang="ts">
import { useSupabase } from "@composables/useSupabase";
import { useRoute } from "vue-router/auto";
import BaseCard from "../base/BaseCard.vue";

const supabase = useSupabase();
// TODO: move route param to chapter
const route = useRoute("/studies/[studyId]/chapters/[chapterId]/");

const { data: lines } = await supabase.from("lines").select("*").eq("chapter", route.params.chapterId).order("name");
</script>
