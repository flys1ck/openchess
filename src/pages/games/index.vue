<template>
  <BaseLink to="/games/lichess">Lichess</BaseLink>
  <!-- <div class="flex-grow overflow-y-auto">

    <hr />
    <div class="m-4">
      {{ prefix }}
    </div>
    <ul class="space-y-4 m-4" v-if="matchingLines">
      <li v-for="line in matchingLines" :key="line.id" class="border p-4 flex flex-col">
        <RouterLink :to="`/studies/${line.study}/chapters/${line.chapter}/lines/${line.id}`">
          {{ line.study.name }} > {{ line.chapter.name }} > {{ line.name }}
        </RouterLink>
        <p class="text-sm text-gray-500 mt-2">{{ line.moves }}</p>
      </li>
    </ul>
  </div> -->
</template>

<script setup lang="ts">
import BaseLink from "@components/base/BaseLink.vue";
import { useSupabase } from "@composables/useSupabase";
import { ref, toRaw } from "vue";

const matchingLines = ref<any[]>([]);

const prefix = ref("");

const supabase = useSupabase();
async function findStudy(moves: string) {
  const { data: longestMatchingPrefix } = await supabase.rpc("get_longest_matching_prefix", { _moves: moves });

  if (!longestMatchingPrefix) return;
  prefix.value = longestMatchingPrefix;

  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, moves, study(id, name), chapter(id, name)")
    .like("moves", `${longestMatchingPrefix}%`)
    .limit(10);

  if (!lines) return;
  matchingLines.value = lines;
}
</script>
