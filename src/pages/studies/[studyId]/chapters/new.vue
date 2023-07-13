<template>
  <form class="m-4 space-y-4" @submit.prevent="onSubmit">
    <div>
      <BaseInputLabel htmlFor="chapter-name" class="block text-sm font-medium leading-6 text-gray-900"
        >Chapter Header</BaseInputLabel
      >
      <select id="chapter-name" v-model="chapterHeader">
        <option value="White">White</option>
        <option value="Black">Black</option>
      </select>
    </div>
    <div>
      <BaseInputLabel htmlFor="line-name" class="block text-sm font-medium leading-6 text-gray-900"
        >Line Header</BaseInputLabel
      >
      <select id="line-name" v-model="lineHeader">
        <option value="">Leave blank</option>
        <option value="White">White</option>
        <option value="Black">Black</option>
      </select>
    </div>
    <div>
      <BaseInputLabel htmlFor="cover-photo" class="block text-sm font-medium leading-6 text-gray-900"
        >PGNs</BaseInputLabel
      >
      <BaseFileUpload v-model="files" :multiple="true" accept=".pgn" />
    </div>
    <BaseButton type="submit" class="mt-8">Upload</BaseButton>
  </form>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import { useSupabase } from "@composables/useSupabase";
import { Chess } from "chess.js";
import { ref } from "vue";
import { definePage, useRoute } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const route = useRoute("/studies/[studyId]/chapters/new");
const files = ref<File[]>([]);
const chapterHeader = ref("");
const lineHeader = ref("");

function onSubmit() {
  files.value.forEach((file) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", (e) => {
      processPgn(e.target?.result as string);
    });
    fileReader.readAsText(file);
  });
}

const supabase = useSupabase();

async function processPgn(pgn: string) {
  const game = new Chess();
  game.loadPgn(pgn);

  const headers = game.header();
  const chapterName = headers[chapterHeader.value];
  const lineName = lineHeader.value ? headers[lineHeader.value] : "";

  const moves = game.history().reduce((acc, move, i) => {
    if (i % 2 == 0) return `${acc} ${i / 2 + 1}. ${move}`;
    return `${acc} ${move}`;
  }, "");

  // TODO: !!! enable RLS !!!
  const { data: chapter } = await supabase
    .from("chapters")
    .upsert(
      {
        name: chapterName,
        study: Number(route.params.studyId),
      },
      {
        onConflict: "study, name",
      }
    )
    .select("*")
    .limit(1)
    .single();

  if (!chapter) return;

  await supabase.from("lines").upsert(
    {
      chapter: chapter.id,
      name: lineName,
      pgn,
      moves,
    },
    {
      onConflict: "chapter, name",
    }
  );
}
</script>
