<template>
  <div class="overflow-y-auto">
    <!-- Study Database -->
    <BaseSidebarSectionHeading>Studies</BaseSidebarSectionHeading>
    <template v-if="positions.length">
      <div class="flex justify-between border-y bg-gray-100 px-4 py-0.5 text-xs leading-6 text-gray-600">
        <span class="font-semibold">Moves in Study</span>
        <span class="font-light">Number of Lines</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="position in positions" :key="position.id">
          <!-- TODO: shapes are not refreshing when there is no pointer movement -->
          <button class="flex w-full justify-between px-4 py-0.5 text-sm hover:bg-orange-200"
            @click="() => game.playMove(position.source, position.destination)" @pointermove="() => game.setAutoShapes([{ brush: 'paleBlue', orig: position.source, dest: position.destination }])
              " @pointerleave="() => game.setAutoShapes([])">
            <span class="font-medium">{{ position.san }}</span>
            <span>{{ position.study_count }}</span>
          </button>
        </li>
      </ul>
      <div class="flex justify-between border-y bg-gray-100 px-4 py-0.5 text-xs leading-6 text-gray-600">
        <span class="font-semibold">Lines with Position</span>
      </div>
      <ul class="divide-y">
        <li v-for="line in lines" :key="line.line_id">
          <RouterLink :to="`/studies/${line.study_id}/chapters/${line.chapter_id}/lines/${line.line_id}`"
            class="flex flex-col px-4 py-2 hover:bg-orange-200"
            @pointermove="() => game.setAutoShapes([{ brush: 'paleBlue', orig: line.source, dest: line.destination }])"
            @pointerleave="() => game.setAutoShapes([])">
            <span class="text-xs text-gray-500"> {{ line.study_name }} - {{ line.chapter_name }} </span>
            <span class="text-sm font-medium">{{ line.line_name }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
    <p v-else class="p-2 text-center text-sm italic text-gray-700">No lines with this position</p>
    <!-- Masters Database -->
    <BaseSidebarSectionHeading>Master's Database</BaseSidebarSectionHeading>
    <template v-if="masterMoves.length || masterGames.length">
      <div class="flex justify-between border-y bg-gray-100 px-4 py-0.5 text-xs leading-6 text-gray-600">
        <span class="font-semibold">Moves</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="move in masterMoves" :key="move.uci">
          <button class="flex w-full items-center justify-between px-4 py-0.5 text-sm hover:bg-orange-200"
            @click="() => game.playMove(move.uci.substring(0, 2) as Key, move.uci.substring(2, 4) as Key)" @pointermove="() =>
              game.setAutoShapes([
                { brush: 'paleBlue', orig: move.uci.substring(0, 2) as Key, dest: move.uci.substring(2, 4) as Key },
              ])
              " @pointerleave="() => game.setAutoShapes([])">
            <div class="inline-flex gap-2">
              <span class="w-12 text-left font-medium">{{ move.san }}</span>
              <span class="w-10 text-right font-light">{{ move.playPercentage }}%</span>
            </div>
            <div class="inline-flex w-56 overflow-hidden rounded border text-xs font-light">
              <span v-if="move.whiteWinPercentage" class="bg-white text-gray-900"
                :style="`width: ${move.whiteWinPercentage}%`">
                {{ percentageText(move.whiteWinPercentage) }}
              </span>
              <span v-if="move.drawPercentage" class="bg-gray-300 text-gray-800"
                :style="`width: ${move.drawPercentage}%`">
                {{ percentageText(move.drawPercentage) }}
              </span>
              <span v-if="move.blackWinPercentage" class="flex-grow bg-gray-600 text-gray-50">
                {{ percentageText(move.blackWinPercentage) }}
              </span>
            </div>
          </button>
        </li>
      </ul>
      <div class="flex justify-between border-y bg-gray-100 px-4 py-0.5 text-xs leading-6 text-gray-600">
        <span class="font-semibold">Games</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="topGame in masterGames" :key="topGame.id">
          <button class="flex w-full items-center justify-between px-4 py-0.5 text-sm hover:bg-orange-200"
            @click="() => game.playMove(topGame.uci.substring(0, 2) as Key, topGame.uci.substring(2, 4) as Key)"
            @pointermove="() =>
              game.setAutoShapes([
                {
                  brush: 'paleBlue',
                  orig: topGame.uci.substring(0, 2) as Key,
                  dest: topGame.uci.substring(2, 4) as Key,
                },
              ])
              " @pointerleave="() => game.setAutoShapes([])">
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
    <p v-else class="p-2 text-center text-sm italic text-gray-700">No games with this position</p>
  </div>
</template>

<script setup lang="ts">
import BaseSidebarSectionHeading from "@/components/base/BaseSidebarSectionHeading.vue";
import { db, select } from "@/services/database";
import GameResultTag from "@components/sidebar/GameResultTag.vue";
import { useGame } from "@composables/useGame";
import { MasterGameCollection } from "@services/lichess";
import { useLichess } from "@stores/useLichess";
import { roundToFixed } from "@utilities/math";
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

const lichess = useLichess();
const positions = shallowRef<any[]>([]);
const lines = shallowRef<any[]>([]);
const totalMasterMoves = shallowRef(0);
const masterGames = shallowRef<MasterGameCollection["topGames"]>([]);
type MasterMove = MasterGameCollection["moves"][number] & MoveStatistics;
const masterMoves = shallowRef<MasterMove[]>([]);

watchEffect(async () => {
  const fenWithoutMoves = props.game.fen.value.replaceAll(/ \d+ \d+$/g, "");
  const positionGroupByQuery = db
    .selectFrom("positions")
    .select(({ fn }) => ["source", "destination", "san", fn.count<number>("study").as("study_count")])
    .where("positions.fen", "like", `${fenWithoutMoves}%`)
    .groupBy(["source", "destination", "san"])
    .orderBy("study_count desc")
    .compile();

  positions.value = await select(positionGroupByQuery);

  const positionQuery = db
    .selectFrom("positions")
    .innerJoin("studies", "studies.id", "positions.study")
    .innerJoin("chapters", "chapters.id", "positions.chapter")
    .innerJoin("lines", "lines.id", "positions.line")
    .select([
      "positions.source",
      "positions.destination",
      "studies.id as study_id",
      "studies.name as study_name",
      "chapters.id as chapter_id",
      "chapters.name as chapter_name",
      "lines.id as line_id",
      "lines.name as line_name",
    ])
    .where("positions.fen", "like", `${fenWithoutMoves}%`)
    .limit(10)
    .compile();

  lines.value = await select(positionQuery);

  lichess.client
    .getMasterGames({ fen: props.game.fen.value, topGames: 10 })
    .then(({ moves, topGames, white, black, draws }) => {
      totalMasterMoves.value = white + black + draws;
      masterMoves.value = moves.map((move) => ({ ...move, ...getMoveStatistics(move) }));
      masterGames.value = topGames;
    });
});

function getMoveStatistics(move: MasterGameCollection["moves"][number]): MoveStatistics {
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
