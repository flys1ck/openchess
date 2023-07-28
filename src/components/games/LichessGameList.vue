<template>
  <ul class="space-y-4 m-4">
    <li v-for="game in games" :key="game.id" class="border p-4 flex items-center gap-8">
      <RouterLink :to="`/games/lichess/${game.id}`">
        <span>{{ game.players.white.user.name }} vs. {{ game.players.black.user.name }}</span>
        <div v-if="game.opening" class="text-gray-500">{{ game.opening.name }}</div>
        <p class="text-sm text-gray-500 mt-2">{{ game.moves }}</p>
      </RouterLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { LichessGame, exportGamesByUser } from "@services/lichess";
import { ref } from "vue";

const games = ref<LichessGame[]>([]);
games.value = await exportGamesByUser(
  "Zwickzwackzwieback",
  { max: 3, opening: true },
  { accept: "application/x-ndjson" }
);
</script>
