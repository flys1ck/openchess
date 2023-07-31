<template>
  <div class="overflow-y-auto">
    <div class="text-xs leading-6 text-gray-600 px-4 py-0.5 flex justify-between bg-gray-100 border-b">
      <span class="font-semibold">Moves in Study</span>
      <span class="font-light">Number of Lines</span>
    </div>
    <ul class="flex flex-col divide-y">
      <li v-for="position in positions">
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
  </div>
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
const lines = ref<any[]>([]);

watchEffect(() => {
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
    .limit(20)
    .then(({ data }) => {
      if (!data) return;
      lines.value = data;
    });
});
</script>
