<template>
  <div class="flex-grow overflow-y-auto">
    <ul class="space-y-4 m-4">
      <li v-for="game in games" :key="game.tags?.Site" class="border p-4 flex items-center gap-8">
        <div>
          <span>{{ game.tags?.White }} vs. {{ game.tags?.Black }}</span>
          <div class="text-gray-500">{{ game.tags?.Opening }}</div>
          <p class="text-sm text-gray-500 mt-2">{{ getMoves(game.moves) }}</p>
        </div>
        <BaseButton @click="findStudy(getMoves(game.moves))">Matching Lines</BaseButton>
      </li>
    </ul>
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
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import { useSupabase } from "@composables/useSupabase";
import { ParseTree, parse } from "@mliebelt/pgn-parser";
import { exportGamesByUser } from "@services/lichess";
import { ref, toRaw } from "vue";

const games = ref<ParseTree[]>([]);
const matchingLines = ref<any[]>([]);
const prefix = ref("");

exportGamesByUser("Zwickzwackzwieback", { max: 3, opening: true }).then((lichessGames) => {
  games.value = parse(lichessGames, { startRule: "games" }) as ParseTree[];
  console.log(toRaw(games.value));
});

function getMoves(moves: ParseTree["moves"]) {
  return moves
    .reduce((acc, move, i) => {
      if (i % 2 == 0) return `${acc}${i / 2 + 1}. ${move.notation.notation}`;
      return `${acc} ${move.notation.notation} `;
    }, "")
    .trim();
}

const supabase = useSupabase();
async function findStudy(moves: string) {
  const { data: longestMatchingPrefix } = await supabase.rpc("get_longest_matching_prefix", { _moves: moves });

  console.log("prefix:", longestMatchingPrefix);

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
