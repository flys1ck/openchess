<template>
  <Tabs
    v-model="selectedTab"
    as="aside"
    activation-mode="manual"
    :unmount-on-hide="false"
    class="flex w-96 shrink-0 flex-col gap-0 border-l 2xl:w-120"
  >
    <TabsList class="mx-1 mt-1 w-auto">
      <TabsTrigger v-for="tab in TABS" :key="tab" :value="tab">{{ tab }}</TabsTrigger>
    </TabsList>
    <!-- Game Tab -->
    <TabsContent value="Game" class="flex grow flex-col justify-between overflow-hidden text-base" :tabindex="-1">
      <!-- Engine evaluation -->
      <Suspense>
        <GameEvaluation :fen="game.fen" @update:bestmoves="setBestMoveArrows" />
      </Suspense>
      <!-- Move history -->
      <template v-if="game.tree.root.value">
        <div class="grow overflow-y-auto scroll-smooth">
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
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :disabled="game.tree.root.value?.id === game.tree.activeNode.value?.id"
                  aria-label="Skip to initial position"
                  @click="toFirstMove"
                >
                  <ChevronsLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Skip to initial position
                <Kbd><ArrowUp /></Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.previousPosition"
                  aria-label="Previous move"
                  @click="toPreviousMove"
                >
                  <ChevronLeft />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Previous move
                <Kbd><ArrowLeft /></Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                  aria-label="Next move"
                  @click="toNextMove"
                >
                  <ChevronRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Next move
                <Kbd><ArrowRight /></Kbd>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon-sm"
                  :disabled="!game.tree.activeNode.value || !game.tree.activeNode.value.nextPosition"
                  aria-label="Skip to last move"
                  @click="toLastMove"
                >
                  <ChevronsRight />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Skip to last move
                <Kbd><ArrowDown /></Kbd>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </template>
    </TabsContent>
    <!-- Positions Tab -->
    <TabsContent value="Positions" class="flex grow flex-col overflow-hidden text-base">
      <GamePositions :game="game" @line-click="selectedTab = 'Game'" />
    </TabsContent>
    <!-- Settings Tab -->
    <TabsContent value="Settings" class="text-base">
      <BaseSidebarSectionHeading heading="Game & Board" />
      <div class="flex flex-col gap-2 p-4">
        <Button variant="outline" @click="game.createNewGame">New Game</Button>
        <Button variant="outline" @click="game.toggleOrientation">
          Toggle Orientation
          <Kbd>f</Kbd>
        </Button>
      </div>
      <BaseSidebarSectionHeading class="mt-2" heading="Engine" />
      <FieldGroup class="gap-4 p-4">
        <Field>
          <div class="flex items-center justify-between">
            <Label>Multiple Lines</Label>
            <span class="text-muted-foreground text-sm">{{ settings.engineLines[0] }}</span>
          </div>
          <Slider :min="1" :max="5" v-model="settings.engineLines" />
        </Field>
        <Field>
          <div class="flex items-center justify-between">
            <Label>Depth</Label>
            <span class="text-muted-foreground text-sm">{{ settings.engineDepth[0] }}</span>
          </div>
          <Slider :min="1" :max="100" v-model="settings.engineDepth" />
        </Field>
      </FieldGroup>
    </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import BaseSidebarSectionHeading from "@components/base/BaseSidebarSectionHeading.vue";
import GameEvaluation from "@components/sidebar/GameEvaluation.vue";
import GamePositions from "@components/sidebar/GamePositions.vue";
import GameTreeItem from "@components/sidebar/GameTreeItem.vue";
import { useGame } from "@composables/useGame";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "@lucide/vue";
import { useSettings } from "@stores/useSettings";
import { DrawShape } from "chessground/draw";
import { Key } from "chessground/types";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Kbd } from "@/components/ui/kbd";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();

const settings = useSettings();

const TABS = ["Game", "Positions", "Settings"];
const selectedTab = ref("Game");

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
