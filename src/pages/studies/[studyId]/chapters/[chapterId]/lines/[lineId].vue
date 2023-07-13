<template>
  <main class="flex-grow overflow-y-auto overflow-x-hidden flex">
    <div class="flex-grow">
      <TheChessboard :game="game" />
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import TheChessboard from "@components/TheChessboard.vue";
import GameContextSidebar from "@components/sidebar/GameContextSidebar.vue";
import { useGame } from "@composables/useGame";
import { useSupabase } from "@composables/useSupabase";
import { definePage, useRoute } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const route = useRoute("/studies/[studyId]/chapters/[chapterId]/lines/[lineId]");
const supabase = useSupabase();

const game = useGame();
supabase
  .from("lines")
  .select("pgn")
  .eq("id", route.params.lineId)
  .limit(1)
  .single()
  .then(({ data }) => {
    game.tree.fromPgn(data!.pgn);
    if (!game.tree.root.value) return;
    game.setActivePosition(game.tree.root.value);
  });
</script>
