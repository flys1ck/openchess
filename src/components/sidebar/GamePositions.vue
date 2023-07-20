<template>
  <ul class="flex flex-col">
    <li v-for="position in positions">
      <!-- TODO: shapes are not refreshing when there is no poitner movement -->
      <button
        class="flex justify-between w-full py-0.5 px-4 hover:bg-gray-200"
        @click="() => game.playMove(position.source, position.destination)"
        @pointermove="
          () => game.setAutoShapes([{ brush: 'paleBlue', orig: position.source, dest: position.destination }])
        "
        @pointerleave="() => game.setAutoShapes([])"
      >
        <span>{{ position.san }}</span>
        <span>{{ position.study_count }}</span>
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useGame } from "@composables/useGame";
import { useSupabase } from "@composables/useSupabase";
import { ref, watchEffect } from "vue";

const props = defineProps<{
  game: ReturnType<typeof useGame>;
}>();

const supabase = useSupabase();
const positions = ref<any[]>([]);

watchEffect(() => {
  supabase
    .rpc("get_moves_by_fen", { _fen: props.game.fen.value })
    .select("*")
    .then(({ data }) => {
      if (!data) return;
      positions.value = data;
    });
});
</script>
