<template>
  <TabGroup as="aside" class="flex flex-col border-l border-gray-200 w-80">
    <TabList class="flex justify-around border-b border-gray-200">
      <Tab v-for="tab in TABS" :key="tab" as="template" v-slot="{ selected }">
        <button
          :class="
            selected
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          "
          class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium w-1/2"
        >
          {{ tab }}
        </button>
      </Tab>
    </TabList>
    <TabPanels as="template">
      <!-- Game Tab -->
      <TabPanel class="flex-grow flex flex-col justify-between overflow-hidden">
        <!-- Engine evaluation -->
        <!-- <GameEvaluation /> -->
        <!-- Move history -->
        <div class="flex-grow overflow-auto">
          <div class="grid grid-cols-16 items-stretch">
            <GameTreeItem
              v-if="game.tree.root.value"
              :node="game.tree.root.value"
              :active-node-id="game.tree.activeNode.value?.id"
              @nodeselect="game.setActivePosition"
            />
          </div>
        </div>
        <div class="p-4 flex flex-col gap-2 border-t">
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
      </TabPanel>
      <!-- Settings Tab -->
      <TabPanel>
        <div class="flex flex-col">
          <BaseButton variant="secondary" @click="game.createNewGame">New Game</BaseButton>
          <BaseButton variant="secondary" @click="game.board?.toggleOrientation">Toggle Orientation</BaseButton>
        </div>
      </TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import BaseButton from "../base/BaseButton.vue";
import GameTreeItem from "../sidebar/GameTreeItem.vue";

import { useGame } from "@composables/useGame";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/20/solid";
import { onKeyStroke } from "@vueuse/core";

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();

const TABS = ["Game", "Settings"];

// TODO: revisit, might be broken when activeElement `null`
// also might work unexpected, when tabs/buttons have focus
onKeyStroke("ArrowLeft", () => {
  if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toPreviousMove((node) => props.game.setActivePosition(node));
});
onKeyStroke("ArrowRight", () => {
  if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toNextMove((node) => props.game.setActivePosition(node));
});
onKeyStroke("ArrowUp", () => {
  if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toFirstMove((node) => props.game.setActivePosition(node));
});
onKeyStroke("ArrowDown", () => {
  if (document.activeElement?.tagName !== "BODY") return;
  props.game.tree.toLastMove((node) => props.game.setActivePosition(node));
});
</script>
