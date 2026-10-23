<template>
  <li>
    <Card class="hover:bg-muted/50 relative flex-row items-center gap-4 p-3 transition-colors has-focus-visible:ring-3">
      <GameBoardThumbnail class="w-28 shrink-0" :position="game.finalPosition" :orientation="playerColor ?? 'white'" />
      <div class="min-w-0 grow space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 space-y-1">
            <GameCardPlayer :player="game.players.white" color="white" :is-player="playerColor === 'white'" />
            <GameCardPlayer :player="game.players.black" color="black" :is-player="playerColor === 'black'" />
          </div>
          <GameOutcomeBadge :result="game.result" :player-color="playerColor" />
        </div>
        <div class="space-y-0.5 text-xs">
          <p v-if="openingName" class="truncate font-medium">{{ openingName }}</p>
          <p v-if="game.moves" class="text-muted-foreground truncate">{{ game.moves }}</p>
        </div>
      </div>
      <dl class="text-muted-foreground w-40 shrink-0 space-y-1 self-stretch border-l pl-4 text-xs whitespace-nowrap">
        <div v-if="timeControl" class="flex items-center gap-2">
          <dt>
            <span class="sr-only">Time control</span>
            <Timer class="size-3.5" />
          </dt>
          <dd class="text-foreground">{{ timeControl }}</dd>
        </div>
        <div class="flex items-center gap-2">
          <dt>
            <span class="sr-only">Played</span>
            <Calendar class="size-3.5" />
          </dt>
          <dd><BaseTime :date="new Date(game.createdAt)" /></dd>
        </div>
        <div class="flex items-center gap-2">
          <dt>
            <span class="sr-only">Length</span>
            <Hash class="size-3.5" />
          </dt>
          <dd>{{ moveCount }} {{ moveCount === 1 ? "move" : "moves" }}</dd>
        </div>
      </dl>
      <RouterLink
        :to="to"
        class="absolute inset-0 z-10 rounded-xl focus:outline-hidden"
        :aria-label="`${game.players.white.name} vs. ${game.players.black.name}`"
      />
    </Card>
  </li>
</template>

<script setup lang="ts">
import BaseTime from "@components/base/BaseTime.vue";
import GameBoardThumbnail from "@components/games/GameBoardThumbnail.vue";
import GameCardPlayer from "@components/games/GameCardPlayer.vue";
import GameOutcomeBadge from "@components/games/GameOutcomeBadge.vue";
import { Calendar, Hash, Timer } from "@lucide/vue";
import { ChessGame, GameColor } from "@utilities/normalizer";
import { computed } from "vue";
import { Card } from "@/components/ui/card";

const props = defineProps<{
  to: string;
  game: ChessGame;
  playerColor?: GameColor;
}>();

const SPEED_LABELS: Record<string, string> = {
  ultraBullet: "UltraBullet",
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rapid",
  classical: "Classical",
  correspondence: "Correspondence",
  daily: "Daily",
};
const CLOCK_FRACTIONS: Record<number, string> = { 15: "¼", 30: "½", 45: "¾" };

const timeControl = computed(() => {
  const speed = props.game.speed ? (SPEED_LABELS[props.game.speed] ?? props.game.speed) : undefined;
  const { clock } = props.game;
  if (!clock) return speed;
  const minutes = CLOCK_FRACTIONS[clock.initial] ?? `${clock.initial / 60}`;
  return [`${minutes}+${clock.increment}`, speed].filter(Boolean).join(" · ");
});

const openingName = computed(() => {
  if (props.game.opening?.name) return props.game.opening.name;
  if (props.game.variant === "fromPosition") return "From position";
  return undefined;
});

const moveCount = computed(() => Math.ceil(props.game.plyCount / 2));
</script>
