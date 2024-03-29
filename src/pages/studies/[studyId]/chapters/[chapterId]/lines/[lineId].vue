<template>
  <GameMain :game="game" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { AcademicCapIcon } from "@heroicons/vue/20/solid";
import { db, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { watch } from "vue";
import { definePage, useRoute } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();

const route = useRoute("/studies/[studyId]/chapters/[chapterId]/lines/[lineId]");
const game = useGame();

watch(
  route,
  () => {
    const lineQuery = db
      .selectFrom("lines")
      .innerJoin("studies", "studies.id", "lines.study")
      .innerJoin("chapters", "chapters.id", "lines.chapter")
      .select([
        "lines.id",
        "lines.name",
        "lines.pgn",
        "lines.orientation",
        "studies.id as study_id",
        "studies.name as study_name",
        "chapters.id as chapter_id",
        "chapters.name as chapter_name",
      ])
      .where("lines.id", "=", Number(route.params.lineId))
      .compile();
    selectFirst(lineQuery).then((line) => {
      game.setOrientation(line.orientation as "white" | "black");
      game.tree.fromPgn(line.pgn);
      if (!game.tree.root.value) return;

      const plyCount = parseInt(route.hash.replace("#", ""));
      game.setActivePositionByPlyCount(plyCount);

      // set breadcrumbs
      setBreadcrumbs([
        {
          icon: AcademicCapIcon,
          name: "Studies",
          to: "/studies/",
        },
        {
          name: line.study_name,
          to: `/studies/${line.study_id}`,
        },
        {
          name: line.chapter_name,
          to: `/studies/${line.study_id}/chapters/${line.chapter_id}`,
        },
        {
          name: line.name,
          to: `/studies/${line.study_id}/chapters/${line.chapter_id}/lines/${line.id}`,
        },
      ]);
    });
  },
  { immediate: true }
);
</script>
