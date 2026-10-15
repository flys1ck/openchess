<template>
  <ul class="space-y-4">
    <GameCard v-for="game in normalizedGames" :key="game.id" :to="`/games/lichess/${game.id}`" :game="game" />
  </ul>
</template>

<script setup lang="ts">
import GameCard from "@components/games/GameCard.vue";
import { exportGamesOfAuser, type GameJson } from "@flys1ck/lichess-client";
import { useLichess } from "@stores/useLichess";
import { normalizeLichessGame } from "@utilities/normalizer";
import { computed, shallowRef } from "vue";

defineExpose({ refresh });

const lichess = useLichess();

async function fetchGames(): Promise<GameJson[]> {
  const response = await exportGamesOfAuser({
    path: { username: lichess.username },
    query: { max: 5, opening: true },
    parseAs: "text",
    headers: { Accept: "application/x-ndjson" },
  });

  const text = (response.data as string) ?? "";
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) return parsed as GameJson[];
  } catch {}

  return text
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as GameJson);
}

const games = shallowRef<GameJson[]>(await fetchGames());

const normalizedGames = computed(() => {
  return games.value.map((game) => {
    return normalizeLichessGame(game);
  });
});

async function refresh() {
  games.value = await fetchGames();
}
</script>
