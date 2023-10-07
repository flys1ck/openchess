<template>
  <main class="flex flex-grow overflow-x-hidden">
    <div class="flex flex-grow flex-col overflow-y-auto">
      <!-- use name from settings -->
      <GameChessboard
        :game="game"
        :orientation="parsedGame.tags!['Black'] === lichess.username ? 'black' : 'white'"
        class="max-w-4xl flex-grow p-4"
      />
      <div>
        <hr class="mt-12" />
        <div class="m-4">
          {{ prefix }}
        </div>
        <ul class="m-4 space-y-4" v-if="matchingLines">
          <li v-for="line in matchingLines" :key="line.id" class="flex flex-col border p-4">
            <RouterLink :to="`/studies/${line.study}/chapters/${line.chapter}/lines/${line.id}`">
              {{ line.study.name }} > {{ line.chapter.name }} > {{ line.name }}
            </RouterLink>
            <p class="mt-2 text-sm text-gray-500">{{ line.moves }}</p>
          </li>
        </ul>
      </div>
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router/auto";
import GameChessboard from "@components/GameChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { useSupabase } from "@composables/useSupabase";
import { ref } from "vue";
import { ParseTree, parse } from "@mliebelt/pgn-parser";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useLichess } from "@stores/useLichess";

const route = useRoute("/games/lichess/[gameId]");
const lichess = useLichess();
const lichessGamePgn = await lichess.client.exportGameById(route.params.gameId);

const game = useGame();
game.createNewGame();
game.tree.fromPgn(lichessGamePgn);

if (game.tree.root.value) game.setActivePosition(game.tree.root.value);

const matchingLines = ref<any[]>([]);
const prefix = ref("");
const supabase = useSupabase();
const parsedGame = parse(lichessGamePgn, { startRule: "game" }) as ParseTree;
const moves = parsedGame.moves
  .reduce((acc, move, i) => {
    if (i % 2 == 0) return `${acc}${i / 2 + 1}. ${move.notation.notation}`;
    return `${acc} ${move.notation.notation} `;
  }, "")
  .trim();

const { data: longestMatchingPrefix } = await supabase.rpc("get_longest_matching_prefix", { _moves: moves });

if (longestMatchingPrefix) {
  prefix.value = longestMatchingPrefix;

  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, moves, study(id, name), chapter(id, name)")
    .like("moves", `${longestMatchingPrefix}%`)
    .limit(10);

  if (lines) matchingLines.value = lines;
}

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Games",
    to: "/games/",
  },
  {
    name: "Lichess",
    to: "/games/lichess/",
  },
  {
    name: `${parsedGame.tags!["White"]} vs. ${parsedGame.tags!["Black"]}`,
    to: `/games/lichess/${route.params.gameId}`,
  },
]);
</script>
