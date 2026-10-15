<template>
  <div class="overflow-y-auto">
    <!-- Study Database -->
    <BaseSidebarSectionHeading heading="Studies" />
    <template v-if="positions.length">
      <div class="bg-muted text-muted-foreground flex justify-between border-y px-4 py-0.5 text-xs leading-6">
        <span class="font-semibold">Moves in Study</span>
        <span class="font-light">Number of Lines</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="position in positions" :key="`${position.source}-${position.destination}-${position.san}`">
          <!-- TODO: shapes are not refreshing when there is no pointer movement -->
          <button
            class="hover:bg-primary/15 flex w-full justify-between px-4 py-0.5 text-sm"
            @click="
              () => {
                game.playMove(position.source, position.destination);
                game.setAutoShapes([], 'temporary');
              }
            "
            @pointermove="
              () =>
                game.setAutoShapes(
                  [{ brush: 'paleBlue', orig: position.source, dest: position.destination }],
                  'temporary'
                )
            "
            @pointerleave="() => game.setAutoShapes([], 'temporary')"
          >
            <span class="font-medium">{{ position.san }}</span>
            <span>{{ position.line_count }}</span>
          </button>
        </li>
      </ul>
      <div class="bg-muted text-muted-foreground flex justify-between border-y px-4 py-0.5 text-xs leading-6">
        <span class="font-semibold">Lines with Position</span>
      </div>
      <ul class="divide-y">
        <li v-for="line in lines" :key="line.line_id">
          <RouterLink
            :to="`/studies/${line.study_id}/chapters/${line.chapter_id}/lines/${line.line_id}/#${line.ply}`"
            class="hover:bg-primary/15 flex flex-col px-4 py-2"
            @pointermove="
              () => game.setAutoShapes([{ brush: 'paleBlue', orig: line.source, dest: line.destination }], 'temporary')
            "
            @pointerleave="() => game.setAutoShapes([], 'temporary')"
            @click="() => $emit('lineClick')"
          >
            <span class="text-muted-foreground text-xs">{{ line.study_name }} - {{ line.chapter_name }}</span>
            <span class="text-sm font-medium">{{ line.line_name }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
    <p v-else class="text-muted-foreground p-2 text-center text-sm italic">No lines with this position</p>
    <!-- Masters Database -->
    <BaseSidebarSectionHeading heading="Master's Database" />
    <template v-if="masterMoves.length || masterGames.length">
      <div class="bg-muted text-muted-foreground flex justify-between border-y px-4 py-0.5 text-xs leading-6">
        <span class="font-semibold">Moves</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="move in masterMoves" :key="move.uci">
          <button
            class="hover:bg-primary/15 flex w-full items-center justify-between px-4 py-0.5 text-sm"
            @click="
              () => {
                game.playMove(move.uci.substring(0, 2) as Key, move.uci.substring(2, 4) as Key);
                game.setAutoShapes([], 'temporary');
              }
            "
            @pointermove="
              () =>
                game.setAutoShapes(
                  [{ brush: 'paleBlue', orig: move.uci.substring(0, 2) as Key, dest: move.uci.substring(2, 4) as Key }],
                  'temporary'
                )
            "
            @pointerleave="() => game.setAutoShapes([], 'temporary')"
          >
            <div class="inline-flex gap-2">
              <span class="w-12 text-left font-medium">{{ move.san }}</span>
              <span class="w-10 text-right font-light">{{ move.playPercentage }}%</span>
            </div>
            <div class="inline-flex w-56 overflow-hidden rounded-sm border text-xs font-light">
              <span
                v-if="move.whiteWinPercentage"
                class="bg-white text-neutral-950"
                :style="`width: ${move.whiteWinPercentage}%`"
              >
                {{ percentageText(move.whiteWinPercentage) }}
              </span>
              <span
                v-if="move.drawPercentage"
                class="bg-neutral-300 text-neutral-800"
                :style="`width: ${move.drawPercentage}%`"
              >
                {{ percentageText(move.drawPercentage) }}
              </span>
              <span v-if="move.blackWinPercentage" class="grow bg-neutral-800 text-neutral-50">
                {{ percentageText(move.blackWinPercentage) }}
              </span>
            </div>
          </button>
        </li>
      </ul>
      <div class="bg-muted text-muted-foreground flex justify-between border-y px-4 py-0.5 text-xs leading-6">
        <span class="font-semibold">Games</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="topGame in masterGames" :key="topGame.id">
          <button
            class="hover:bg-primary/15 flex w-full items-center justify-between px-4 py-0.5 text-sm"
            @click="
              () => {
                game.playMove(topGame.uci.substring(0, 2) as Key, topGame.uci.substring(2, 4) as Key);
                game.setAutoShapes([], 'temporary');
              }
            "
            @pointermove="
              () =>
                game.setAutoShapes([
                  {
                    brush: 'paleBlue',
                    orig: topGame.uci.substring(0, 2) as Key,
                    dest: topGame.uci.substring(2, 4) as Key,
                  },
                ])
            "
            @pointerleave="() => game.setAutoShapes([])"
          >
            <div class="flex gap-2 text-xs">
              <div class="flex flex-col text-left font-light">
                <span>{{ topGame.white.rating }}</span>
                <span>{{ topGame.black.rating }}</span>
              </div>
              <div class="flex flex-col text-left font-medium">
                <span>{{ topGame.white.name }}</span>
                <span>{{ topGame.black.name }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <GameResultTag :result="topGame.winner" />
              <span class="font-light">{{ topGame.month ?? topGame.year }}</span>
            </div>
          </button>
        </li>
      </ul>
    </template>
    <p v-else class="text-muted-foreground p-2 text-center text-sm italic">No games with this position</p>
  </div>
</template>

<script setup lang="ts">
import BaseSidebarSectionHeading from "@components/base/BaseSidebarSectionHeading.vue";
import GameResultTag from "@components/sidebar/GameResultTag.vue";
import { useGame } from "@composables/useGame";
import { explorerClient, mastersDatabase, type OpeningExplorerMasters } from "@flys1ck/lichess-client";
import { db, select } from "@services/database";
import { roundToFixed } from "@utilities/math";
import { getPositionKey } from "@utilities/move";
import { Key } from "chessground/types";
import { shallowRef, watchEffect } from "vue";

type MoveStatistics = {
  moveTotal: number;
  playPercentage: number;
  whiteWinPercentage: number;
  blackWinPercentage: number;
  drawPercentage: number;
};

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();
defineEmits<{
  lineClick: [];
}>();

const positions = shallowRef<any[]>([]);
const lines = shallowRef<any[]>([]);
const totalMasterMoves = shallowRef(0);
const masterGames = shallowRef<OpeningExplorerMasters["topGames"]>([]);
type MasterMove = OpeningExplorerMasters["moves"][number] & MoveStatistics;
const masterMoves = shallowRef<MasterMove[]>([]);

watchEffect(async () => {
  const positionKey = getPositionKey(props.game.fen.value);
  const positionGroupByQuery = db
    .selectFrom("positions")
    .innerJoin("chess_positions", "chess_positions.id", "positions.chess_position")
    .select(({ fn }) => ["source", "destination", "san", fn.count<number>("line").distinct().as("line_count")])
    .where("chess_positions.position_key", "=", positionKey)
    .groupBy(["source", "destination", "san"])
    .orderBy("line_count", "desc")
    .compile();

  positions.value = await select(positionGroupByQuery);

  const positionQuery = db
    .selectFrom("positions")
    .innerJoin("chess_positions", "chess_positions.id", "positions.chess_position")
    .innerJoin("lines", "lines.id", "positions.line")
    .innerJoin("chapters", "chapters.id", "lines.chapter")
    .innerJoin("studies", "studies.id", "chapters.study")
    .select([
      "positions.source",
      "positions.destination",
      "positions.ply",
      "studies.id as study_id",
      "studies.name as study_name",
      "chapters.id as chapter_id",
      "chapters.name as chapter_name",
      "lines.id as line_id",
      "lines.name as line_name",
    ])
    .where("chess_positions.position_key", "=", positionKey)
    .limit(10)
    .compile();

  lines.value = await select(positionQuery);

  mastersDatabase({ client: explorerClient, query: { fen: props.game.fen.value, topGames: 10 } }).then(({ data }) => {
    if (!data) return;
    const { moves, topGames, white, black, draws } = data;
    totalMasterMoves.value = white + black + draws;
    masterMoves.value = moves.map((move) => ({ ...move, ...getMoveStatistics(move) }));
    masterGames.value = topGames;
  });
});

function getMoveStatistics(move: OpeningExplorerMasters["moves"][number]): MoveStatistics {
  const moveTotal = roundToFixed(move.white + move.black + move.draws, 0);
  const playPercentage = roundToFixed((moveTotal * 100) / totalMasterMoves.value, 0);
  const whiteWinPercentage = roundToFixed((move.white * 100) / moveTotal, 0);
  const blackWinPercentage = roundToFixed((move.black * 100) / moveTotal, 0);
  const drawPercentage = roundToFixed((move.draws * 100) / moveTotal, 0);

  return {
    moveTotal,
    playPercentage,
    whiteWinPercentage,
    blackWinPercentage,
    drawPercentage,
  };
}

function percentageText(percentage: number) {
  if (percentage < 10) return "";
  else if (percentage <= 20) return `${percentage}`;
  else return `${percentage}%`;
}
</script>
