<template>
  <GameMain class="min-w-0" :game="game" />
</template>

<script setup lang="ts">
import GameMain from "@components/GameMain.vue";
import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { db, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const { setBreadcrumbs } = useBreadcrumbs();

const route = useRoute("/studies/[studyId]/(workspace)/chapters/[chapterId]/lines/[lineId]");
const router = useRouter();
const game = useGame();

watch(
  () => [route.params.lineId, route.hash],
  async (_, __, onCleanup) => {
    let isStale = false;
    onCleanup(() => (isStale = true));
    const lineQuery = db
      .selectFrom("lines")
      .innerJoin("chapters", "chapters.id", "lines.chapter")
      .innerJoin("studies", "studies.id", "chapters.study")
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
    const line = await selectFirst(lineQuery);
    if (isStale) return;
    if (!line) {
      router.replace(`/studies/${route.params.studyId}`);
      return;
    }

    game.setOrientation(line.orientation as "white" | "black");
    game.loadPgn(line.pgn);
    if (!game.tree.root.value) return;

    if (route.hash) game.setActivePositionByKey(decodeURIComponent(route.hash.slice(1)));

    setBreadcrumbs([
      navigationItems.studies,
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
  },
  { immediate: true }
);
</script>
