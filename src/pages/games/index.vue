<template>
  <div>
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
    <ul class="space-y-4" v-if="matchingLines">
      <li v-for="line in matchingLines" :key="line.id">
        <RouterLink :to="`/studies/${line.study}/chapters/${line.chapter}/lines/${line.id}`">
          {{ line.study.name }} > {{ line.chapter.name }} > {{ line.name }}
        </RouterLink>
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
const matchingLines = ref();

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
  const { data: lines } = await supabase
    .rpc("get_matching_lines", { _moves: moves })
    .select("id, name, study(id, name), chapter(id, name)")
    .limit(10);

  console.log(lines);

  matchingLines.value = lines;
}
</script>
