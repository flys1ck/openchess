<template>
  <TabGroup as="aside" class="flex w-96 shrink-0 flex-col border-l border-gray-200" manual>
    <TabList class="flex justify-around border-b border-gray-200">
      <Tab v-for="tab in TABS" :key="tab" as="template" v-slot="{ selected }">
        <button
          :class="
            selected
              ? 'border-orange-400 text-orange-400'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          "
          class="w-1/2 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium focus:outline-none"
        >
          {{ tab }}
        </button>
      </Tab>
    </TabList>
    <TabPanels as="template">
      <!-- Game Tab -->
      <TabPanel
        :unmount="false"
        class="flex flex-grow flex-col justify-between overflow-hidden focus:outline-none"
        :tab-index="-1"
      >
        <!-- Engine evaluation -->
        <Suspense>
          <GameEvaluation :fen="game.fen" @update:bestmoves="setBestMoveArrows" />
        </Suspense>
        <!-- Move history -->
        <template v-if="game.tree.root.value">
          <div class="flex-grow overflow-y-auto">
            <div class="grid grid-cols-16 items-stretch">
              <GameTreeItem
                :node="game.tree.root.value"
                :active-node-id="game.tree.activeNode.value?.id"
                @nodeselect="game.setActivePosition"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 border-t p-4">
            <div class="flex justify-center gap-4">
              <BaseButton
                variant="secondary"
                size="sm"
                :prefix-icon="ChevronDoubleLeftIcon"
                :disabled="game.tree.root.value?.id === game.tree.activeNode.value?.id"
                aria-label="Skip to first move"
                @click="game.tree.toFirstMove"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                :prefix-icon="ChevronLeftIcon"
                :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.previousPosition"
                aria-label="Previous move"
                @click="game.tree.toPreviousMove"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                :prefix-icon="ChevronRightIcon"
                :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                aria-label="Next move"
                @click="game.tree.toNextMove"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                :prefix-icon="ChevronDoubleRightIcon"
                :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                aria-label="Skip to last move"
                @click="game.tree.toLastMove"
              />
            </div>
          </div>
        </template>
      </TabPanel>
      <!-- Positions Tab -->
      <TabPanel :unmount="false" class="flex flex-grow flex-col overflow-hidden focus:outline-none">
        <GamePositions :game="game" />
      </TabPanel>
      <!-- Settings Tab -->
      <TabPanel>
        <BaseSidebarSectionHeading heading="Game & Board" />
        <div class="flex flex-col p-4">
          <BaseButton variant="secondary" @click="game.createNewGame">New Game</BaseButton>
          <BaseButton class="mt-2" variant="secondary" @click="game.toggleOrientation">Toggle Orientation</BaseButton>
        </div>
        <BaseSidebarSectionHeading class="mt-2" heading="Engine" />
        <div class="p-4">
          <div class="flex items-center justify-between">
            <BaseInputLabel html-for="depth">Multiple Lines</BaseInputLabel>
            <span class="text-sm text-gray-600">{{ settings.engineLines[0] }}</span>
          </div>
          <BaseSlider id="depth" :min="1" :max="5" v-model="settings.engineLines" />
          <div class="mt-2 flex items-center justify-between">
            <BaseInputLabel html-for="depth">Depth</BaseInputLabel>
            <span class="text-sm text-gray-600">{{ settings.engineDepth[0] }}</span>
          </div>
          <BaseSlider id="depth" :min="1" :max="100" v-model="settings.engineDepth" />
        </div>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import BaseButton from "@components/base/BaseButton.vue";
import GameTreeItem from "@components/sidebar/GameTreeItem.vue";
import GamePositions from "@components/sidebar/GamePositions.vue";
import GameEvaluation from "@components/sidebar/GameEvaluation.vue";
import { useGame } from "@composables/useGame";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import { onKeyStroke } from "@vueuse/core";
import BaseSlider from "@/components/base/BaseSlider.vue";
import BaseInputLabel from "@/components/base/BaseInputLabel.vue";
import BaseSidebarSectionHeading from "@/components/base/BaseSidebarSectionHeading.vue";
import { useSettings } from "@/stores/useSettings";
import { Key } from "chessground/types";
import { DrawShape } from "chessground/draw";

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();

const TABS = ["Game", "Positions", "Settings"];
const settings = useSettings();

function setBestMoveArrows(bestMoves: { score: string; from: Key; to: Key }[]) {
  const shapes: DrawShape[] = bestMoves.map((bestMove, i) => ({
    orig: bestMove.from,
    dest: bestMove.to,
    brush: i === 0 ? "paleBlue" : "paleGrey",
    label: {
      text: bestMove.score,
    },
  }));
  props.game.setAutoShapes(shapes);
}

// TODO: revisit, might be broken when activeElement `null`
// also might work unexpected, when tabs/buttons have focus
onKeyStroke("ArrowLeft", () => {
  // if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toPreviousMove((node) => {
    props.game.setActivePosition(node);
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
});
onKeyStroke("ArrowRight", () => {
  // if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toNextMove((node) => {
    props.game.setActivePosition(node);
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
});
onKeyStroke("ArrowUp", (e) => {
  e.preventDefault();
  // if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toFirstMove((node) => {
    props.game.setActivePosition(node);
    document.querySelector(`[data-node-id]`)?.scrollIntoView({ block: "center" });
  });
});
onKeyStroke("ArrowDown", (e) => {
  e.preventDefault();
  // if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toLastMove((node) => {
    props.game.setActivePosition(node);
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
});
</script>
