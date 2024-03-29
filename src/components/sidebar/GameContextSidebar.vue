<template>
  <TabGroup
    as="aside"
    class="flex w-96 shrink-0 flex-col border-l border-gray-200 2xl:w-[30rem]"
    manual
    :selected-index="selectedTab"
    @change="changeTab"
  >
    <TabList class="mx-1 mt-1 flex rounded bg-gray-200 p-1">
      <Tab v-for="tab in TABS" :key="tab" as="template" v-slot="{ selected }">
        <button
          :class="selected ? 'bg-orange-50 font-medium text-orange-400' : 'text-gray-500 hover:text-gray-700'"
          class="flex-grow whitespace-nowrap rounded px-2 py-1 text-sm focus:outline-none"
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
          <div class="flex-grow overflow-y-auto scroll-smooth">
            <div class="grid grid-cols-16 items-stretch">
              <GameTreeItem
                :node="game.tree.root.value"
                :active-node-id="game.tree.activeNode.value?.id"
                @nodeselect="game.setActivePosition"
              />
            </div>
          </div>
          <div class="flex flex-col gap-2 border-t p-4">
            <div class="flex items-center justify-center gap-4">
              <BaseTooltip>
                <template #trigger>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    :prefix-icon="ChevronDoubleLeftIcon"
                    :disabled="game.tree.root.value?.id === game.tree.activeNode.value?.id"
                    aria-label="Skip to initial position"
                    @click="toFirstMove"
                  />
                </template>
                Skip to initial position
                <BaseKbd class="ml-2" :icon="ArrowUpIcon" />
              </BaseTooltip>
              <BaseTooltip>
                <template #trigger>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    :prefix-icon="ChevronLeftIcon"
                    :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.previousPosition"
                    aria-label="Previous move"
                    @click="toPreviousMove"
                  />
                </template>
                Previous move
                <BaseKbd class="ml-2" :icon="ArrowLeftIcon" />
              </BaseTooltip>
              <BaseTooltip>
                <template #trigger>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    :prefix-icon="ChevronRightIcon"
                    :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                    aria-label="Next move"
                    @click="toNextMove"
                  />
                </template>
                Next move
                <BaseKbd :icon="ArrowRightIcon" class="ml-2" />
              </BaseTooltip>
              <BaseTooltip>
                <template #trigger>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    :prefix-icon="ChevronDoubleRightIcon"
                    :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                    aria-label="Skip to last move"
                    @click="toLastMove"
                  />
                </template>
                Skip to last move
                <BaseKbd class="ml-2" :icon="ArrowDownIcon" />
              </BaseTooltip>
            </div>
          </div>
        </template>
      </TabPanel>
      <!-- Positions Tab -->
      <TabPanel :unmount="false" class="flex flex-grow flex-col overflow-hidden focus:outline-none">
        <GamePositions :game="game" @line-click="selectedTab = 0" />
      </TabPanel>
      <!-- Settings Tab -->
      <TabPanel>
        <BaseSidebarSectionHeading heading="Game & Board" />
        <div class="flex flex-col p-4">
          <BaseButton variant="secondary" @click="game.createNewGame">New Game</BaseButton>
          <BaseButton class="mt-2" variant="secondary" @click="game.toggleOrientation"
            >Toggle Orientation
            <BaseKbd class="ml-2">f</BaseKbd>
          </BaseButton>
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
import BaseButton from "@components/base/BaseButton.vue";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import BaseKbd from "@components/base/BaseKbd.vue";
import BaseSidebarSectionHeading from "@components/base/BaseSidebarSectionHeading.vue";
import BaseSlider from "@components/base/BaseSlider.vue";
import BaseTooltip from "@components/base/BaseTooltip.vue";
import GameEvaluation from "@components/sidebar/GameEvaluation.vue";
import GamePositions from "@components/sidebar/GamePositions.vue";
import GameTreeItem from "@components/sidebar/GameTreeItem.vue";
import { useGame } from "@composables/useGame";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@heroicons/vue/24/solid";
import { useSettings } from "@stores/useSettings";
import { DrawShape } from "chessground/draw";
import { Key } from "chessground/types";
import { ref } from "vue";

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();

const settings = useSettings();

const selectedTab = ref(0);
const TABS = ["Game", "Positions", "Settings"];
function changeTab(index: number) {
  selectedTab.value = index;
}

function setBestMoveArrows(bestMoves: { score: string; from: Key; to: Key }[]) {
  const shapes: DrawShape[] = bestMoves.map((bestMove, i) => ({
    orig: bestMove.from,
    dest: bestMove.to,
    brush: i === 0 ? "paleBlue" : "paleGrey",
    label: {
      text: bestMove.score,
    },
  }));
  // TODO: shapes are overriden by hover
  props.game.setAutoShapes(shapes);
}

function toPreviousMove() {
  props.game.toPreviousMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}

function toNextMove() {
  props.game.toNextMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}

function toFirstMove() {
  props.game.toFirstMove(() => {
    document.querySelector(`[data-node-id]`)?.scrollIntoView({ block: "center" });
  });
}

function toLastMove() {
  props.game.toLastMove((node) => {
    document.querySelector(`[data-node-id="${node.id}"]`)?.scrollIntoView({ block: "center" });
  });
}
</script>
