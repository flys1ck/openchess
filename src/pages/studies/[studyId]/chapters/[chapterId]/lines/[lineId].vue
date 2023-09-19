<template>
  <main class="flex flex-grow overflow-y-auto overflow-x-hidden">
    <div class="flex-grow">
      <GameChessboard :game="game" class="max-w-4xl p-4" />
    </div>
    <GameContextSidebar :game="game" />
  </main>
</template>

<script setup lang="ts">
import GameChessboard from "@components/GameChessboard.vue";
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
  .select("name, pgn, study(id, name), chapter(id, name), is_white")
  .eq("id", route.params.lineId)
  .limit(1)
  .single()
  .then(({ data: line }) => {
    if (!line) return;
    if (!line.is_white) game.toggleOrientation();
    game.tree.fromPgn(line.pgn);
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
        //@ts-ignore https://github.com/supabase/postgrest-js/issues?q=is:issue+is:open+SelectQueryError
        name: line?.study.name ?? "",
        //@ts-ignore https://github.com/supabase/postgrest-js/issues?q=is:issue+is:open+SelectQueryError
        to: `/studies/${line?.study.id}`,
      },
      {
        //@ts-ignore https://github.com/supabase/postgrest-js/issues?q=is:issue+is:open+SelectQueryError
        name: line?.chapter.name ?? "",
        //@ts-ignore https://github.com/supabase/postgrest-js/issues?q=is:issue+is:open+SelectQueryError
        to: `/studies/${line?.study.id}/chapters/${line?.chapter?.id}`,
      },
      {
        name: line?.name ?? "",
        //@ts-ignore https://github.com/supabase/postgrest-js/issues?q=is:issue+is:open+SelectQueryError
        to: `/studies/${line?.study.id}/chapters/${line?.chapter?.id}/lines/${line?.id}`,
      },
    ]);
  });
</script>
