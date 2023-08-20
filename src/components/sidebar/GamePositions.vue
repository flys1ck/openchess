<template>
  <div class="overflow-y-auto">
    <!-- Study Database -->
    <div class="relative text-center bg-gray-50 py-2">
      <span class="absolute inset-x-2 border-t top-1/2" aria-hidden="true" />
      <span class="relative bg-inherit px-2 uppercase tracking-wider text-xs font-light text-gray-500">Studies</span>
    </div>
    <template v-if="positions.length">
      <div class="text-xs leading-6 text-gray-600 px-4 py-0.5 flex justify-between bg-gray-100 border-y">
        <span class="font-semibold">Moves in Study</span>
        <span class="font-light">Number of Lines</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="position in positions" :key="position.id">
          <!-- TODO: shapes are not refreshing when there is no pointer movement -->
          <button
            class="flex justify-between w-full py-0.5 px-4 hover:bg-orange-200 text-sm"
            @click="() => game.playMove(position.source, position.destination)"
            @pointermove="
              () => game.setAutoShapes([{ brush: 'paleBlue', orig: position.source, dest: position.destination }])
            "
            @pointerleave="() => game.setAutoShapes([])"
          >
            <span class="font-medium">{{ position.san }}</span>
            <span>{{ position.study_count }}</span>
          </button>
        </li>
      </ul>
      <div class="text-xs leading-6 text-gray-600 px-4 py-0.5 flex justify-between bg-gray-100 border-y">
        <span class="font-semibold">Lines with Position</span>
      </div>
      <ul class="divide-y">
        <li v-for="line in lines" :key="line.line.id">
          <RouterLink
            :to="`/studies/${line.study.id}/chapters/${line.chapter.id}/lines/${line.line.id}`"
            class="flex flex-col px-4 py-2 hover:bg-orange-200"
            @pointermove="() => game.setAutoShapes([{ brush: 'paleBlue', orig: line.source, dest: line.destination }])"
            @pointerleave="() => game.setAutoShapes([])"
          >
            <span class="text-xs text-gray-500"> {{ line.study.name }} - {{ line.chapter.name }} </span>
            <span class="text-sm font-medium">{{ line.line.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </template>
    <p v-else class="p-2 italic text-gray-700 text-sm text-center">No lines with this position</p>
    <!-- Masters Database -->
    <div class="relative text-center bg-gray-50 py-2">
      <span class="absolute inset-x-2 border-t top-1/2" aria-hidden="true" />
      <span class="relative bg-inherit px-2 uppercase tracking-wider text-xs font-light text-gray-500"
        >Masters Database</span
      >
    </div>
    <template v-if="masterMoves.length || masterGames.length">
      <div class="text-xs leading-6 text-gray-600 px-4 py-0.5 flex justify-between bg-gray-100 border-y">
        <span class="font-semibold">Moves</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="move in masterMoves" :key="move.uci">
          <button
            class="flex items-center justify-between w-full py-0.5 px-4 hover:bg-orange-200 text-sm"
            @click="() => game.playMove(move.uci.substring(0, 2) as Key, move.uci.substring(2, 4) as Key)"
            @pointermove="
              () => game.setAutoShapes([{ brush: 'paleBlue', orig: move.uci.substring(0, 2) as Key, dest: move.uci.substring(2, 4) as Key }])
            "
            @pointerleave="() => game.setAutoShapes([])"
          >
            <div class="inline-flex gap-2">
              <span class="font-medium w-12 text-left">{{ move.san }}</span>
              <span class="font-medium w-12 text-left">{{ move.uci }}</span>
              <span class="font-light text-right w-10">{{ move.playPercentage }}%</span>
            </div>
            <div class="border w-56 inline-flex overflow-hidden font-light rounded text-xs">
              <span
                v-if="move.whiteWinPercentage"
                class="bg-white text-gray-900"
                :style="`width: ${move.whiteWinPercentage}%`"
              >
                {{ percentageText(move.whiteWinPercentage) }}
              </span>
              <span
                v-if="move.drawPercentage"
                class="bg-gray-300 text-gray-800"
                :style="`width: ${move.drawPercentage}%`"
              >
                {{ percentageText(move.drawPercentage) }}
              </span>
              <span v-if="move.blackWinPercentage" class="bg-gray-600 text-gray-50 flex-grow">
                {{ percentageText(move.blackWinPercentage) }}
              </span>
            </div>
          </button>
        </li>
      </ul>
      <div class="text-xs leading-6 text-gray-600 px-4 py-0.5 flex justify-between bg-gray-100 border-y">
        <span class="font-semibold">Games</span>
      </div>
      <ul class="flex flex-col divide-y">
        <li v-for="topGame in masterGames" :key="topGame.id">
          <button
            class="flex items-center justify-between w-full py-0.5 px-4 hover:bg-orange-200 text-sm"
            @click="() => game.playMove(topGame.uci.substring(0, 2) as Key, topGame.uci.substring(2, 4) as Key)"
            @pointermove="
              () => game.setAutoShapes([{ brush: 'paleBlue', orig: topGame.uci.substring(0, 2) as Key, dest: topGame.uci.substring(2, 4) as Key }])
            "
            @pointerleave="() => game.setAutoShapes([])"
          >
            <div class="flex gap-2">
              <div class="flex flex-col font-light text-left">
                <span>{{ topGame.white.rating }}</span>
                <span>{{ topGame.black.rating }}</span>
              </div>
              <div class="flex flex-col font-medium text-left">
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
    <p v-else class="p-2 italic text-gray-700 text-sm text-center">No games with this position</p>
  </div>
</template>

<script setup lang="ts">
import GameResultTag from "@components/sidebar/GameResultTag.vue";
import { useGame } from "@composables/useGame";
import { useSupabase } from "@composables/useSupabase";
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

const supabase = useSupabase();
const lichess = useLichess();
const positions = shallowRef<any[]>([]);
const lines = shallowRef<any[]>([]);
const totalMasterMoves = shallowRef(0);
const masterGames = shallowRef<MasterGameCollection["topGames"]>([]);
type MasterMove = MasterGameCollection["moves"][number] & MoveStatistics;
const masterMoves = shallowRef<MasterMove[]>([]);

watchEffect(() => {
  console.log(props.game.fen.value);

  const fenWithoutMoves = props.game.fen.value.replaceAll(/ \d+ \d+$/g, "");
  supabase.rpc("get_moves_by_fen", { _fen: fenWithoutMoves }).then(({ data }) => {
    if (!data) return;
    positions.value = data;
  });

  supabase
    .from("positions")
    .select("source, destination, study (id, name), chapter (id, name), line (id, name)")
    .eq("fen", fenWithoutMoves)
    .order("line(name)")
    .limit(10)
    .then(({ data }) => {
      if (!data) return;
      lines.value = data;
    });

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
