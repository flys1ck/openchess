<template>
  <main class="flex-grow overflow-x-hidden flex">
    <div class="flex-grow flex flex-col overflow-y-auto">
      <TheChessboard :game="game" class="flex-grow p-4 max-w-4xl" />
      <div>
        <hr class="mt-12" />
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
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import { exportGameById } from "@services/lichess";
import { useRoute } from "vue-router/auto";
import TheChessboard from "@components/TheChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { useSupabase } from "@composables/useSupabase";
import { ref } from "vue";
import { ParseTree, parse } from "@mliebelt/pgn-parser";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";

const route = useRoute("/games/lichess/[gameId]");
const lichessGamePgn = await exportGameById(route.params.gameId);

const game = useGame();
game.createNewGame();
// if (!line.is_white) game.toggleOrientation();

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
    name: `${parsedGame.tags!["White"]} vs ${parsedGame.tags!["Black"]}`,
    to: `/games/lichess/${route.params.gameId}`,
  },
]);
</script>
