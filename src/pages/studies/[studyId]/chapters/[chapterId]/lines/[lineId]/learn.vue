<template>
  <div class="flex min-h-0 grow overflow-hidden">
    <div class="flex grow flex-col items-center p-4">
      <GameChessboard
        v-if="line"
        :key="line.id"
        class="aspect-square max-h-full max-w-full grow"
        :game="game"
        :orientation="orientation"
        :allow-navigation="false"
        :movable-color="orientation"
        @ready="trainer.start()"
      />
    </div>
    <StudyTrainerSidebar v-if="line" :trainer="trainer" :line-name="line.name" :analyze-to="analyzeTo" />
  </div>
</template>

<script setup lang="ts">
import GameChessboard from "@components/GameChessboard.vue";
import StudyTrainerSidebar from "@components/studies/StudyTrainerSidebar.vue";
import { useGame } from "@composables/useGame";
import { useStudyTrainer } from "@composables/useStudyTrainer";
import { GraduationCap } from "@lucide/vue";
import { db, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();

const route = useRoute("/studies/[studyId]/chapters/[chapterId]/lines/[lineId]/learn");
const game = useGame();
const trainer = useStudyTrainer(game);

type LoadedLine = {
  id: number;
  name: string;
  pgn: string;
  orientation: string;
  study_id: number;
  study_name: string;
  chapter_id: number;
  chapter_name: string;
};

const line = ref<LoadedLine>();
const orientation = computed(() => (line.value?.orientation === "black" ? "black" : "white"));
const analyzeTo = computed(
  () => `/studies/${route.params.studyId}/chapters/${route.params.chapterId}/lines/${route.params.lineId}`
);

watch(
  route,
  () => {
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
    selectFirst(lineQuery).then((loaded) => {
      game.tree.fromPgn(loaded.pgn);
      if (!game.tree.root.value) return;
      game.toFirstMove();
      trainer.prepare(loaded.orientation === "black" ? "black" : "white");
      line.value = loaded;
      setBreadcrumbs([
        {
          icon: GraduationCap,
          name: "Studies",
          to: "/studies/",
        },
        {
          name: loaded.study_name,
          to: `/studies/${loaded.study_id}`,
        },
        {
          name: loaded.chapter_name,
          to: `/studies/${loaded.study_id}/chapters/${loaded.chapter_id}`,
        },
        {
          name: loaded.name,
          to: `/studies/${loaded.study_id}/chapters/${loaded.chapter_id}/lines/${loaded.id}`,
        },
        {
          name: "Learn",
          to: `/studies/${loaded.study_id}/chapters/${loaded.chapter_id}/lines/${loaded.id}/learn`,
        },
      ]);
    });
  },
  { immediate: true }
);
</script>
