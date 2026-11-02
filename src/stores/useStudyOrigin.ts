import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import { useRouter } from "vue-router";

interface StudyOrigin {
  label: string;
  to: string;
  game: ReturnType<typeof useGame>;
}

const STUDY_PATH = /^\/studies(\/|$)/;

export const useStudyOrigin = defineStore("studyOrigin", () => {
  const router = useRouter();
  // A deep ref would unwrap the refs inside the game instance.
  const origin = shallowRef<StudyOrigin>();

  const returnLink = computed(() => (STUDY_PATH.test(router.currentRoute.value.path) ? origin.value : undefined));

  router.afterEach((to) => {
    if (!STUDY_PATH.test(to.path) && to.fullPath !== origin.value?.to) origin.value = undefined;
  });

  function rememberOrigin(game: StudyOrigin["game"]) {
    const { name, path, fullPath } = router.currentRoute.value;
    // Going from one study line to another keeps the game the user started from.
    if (STUDY_PATH.test(path)) return;

    const label = name === navigationItems.analysis.to ? "Back to analysis" : "Back to game";
    origin.value = { label, to: fullPath, game };
  }

  function takeGame(fullPath: string) {
    if (origin.value?.to !== fullPath) return undefined;

    const { game } = origin.value;
    origin.value = undefined;
    return game;
  }

  return { returnLink, rememberOrigin, takeGame };
});
