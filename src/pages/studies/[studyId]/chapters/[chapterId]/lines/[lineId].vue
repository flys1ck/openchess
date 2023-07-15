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
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage, useRoute } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();

const route = useRoute("/studies/[studyId]/chapters/[chapterId]/lines/[lineId]");
const supabase = useSupabase();

const game = useGame();
supabase
  .from("lines")
  .select("name, pgn, study(id, name), chapter(id, name)")
  .eq("id", route.params.lineId)
  .limit(1)
  .single()
  .then(({ data: line }) => {
    game.tree.fromPgn(line!.pgn);
    if (!game.tree.root.value) return;
    game.setActivePosition(game.tree.root.value);

    // set breadcrumbs
    setBreadcrumbs([
      {
        icon: AcademicCapIcon,
        name: "Studies",
        to: "/studies/",
      },
      {
        name: line?.study.name ?? "",
        to: `/studies/${line?.study.id}`,
      },
      {
        name: line?.chapter.name ?? "",
        to: `/studies/${line?.study.id}/chapters/${line?.chapter?.id}`,
      },
      {
        name: line?.name ?? "",
        to: `/studies/${line?.study.id}/chapters/${line?.chapter?.id}/lines/${line?.id}`,
      },
    ]);
  });
</script>
