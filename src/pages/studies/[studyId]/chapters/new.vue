<template>
  <BaseContainer>
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
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@/components/base/BaseContainer.vue";
import { db, execute } from "@/services/database";
import BaseButton from "@components/base/BaseButton.vue";
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
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
const chapterHeader = ref("White");
const lineHeader = ref("Black");

function onSubmit() {
  const fileReader = new FileReader();
  fileReader.addEventListener("load", (e) => {
    processPgn(e.target?.result as string);
  });
  files.value.forEach((file) => {
    fileReader.readAsText(file);
  });
}

async function processPgn(pgn: string) {
  const game = new Chess();
  game.loadPgn(pgn);

  const headers = game.header();
  const chapterName = headers[chapterHeader.value];
  const lineName = lineHeader.value ? headers[lineHeader.value] : "";

  // TODO same function in game index
  const history = game.history({ verbose: true });
  const moves = history
    .reduce((acc, move) => {
      return `${acc} ${move.san}`;
    }, "")
    .trim();

  // TODO: !!! enable RLS !!!
  const chapterQuery = db
    .insertInto("chapters")
    .values({
      name: chapterName,
      study: Number(route.params.studyId),
    })
    .onConflict((oc) => oc.columns(["study", "name"]).doNothing())
    .compile();

  const chapterId = (await execute(chapterQuery)).lastInsertId;

  const lineQuery = db
    .insertInto("lines")
    .values({ study: Number(route.params.studyId), chapter: chapterId, name: lineName, pgn, moves })
    .onConflict((oc) => oc.columns(["chapter", "moves"]).doNothing())
    .compile();
  const lineId = (await execute(lineQuery)).lastInsertId;

  const positions = history.map((move) => {
    return {
      fen: move.before,
      source: move.from,
      destination: move.to,
      san: move.san,
      study: Number(route.params.studyId),
      chapter: chapterId,
      line: lineId,
    };
  });

  const positionsQuery = db
    .insertInto("positions")
    .values(positions)
    .onConflict((oc) => oc.columns(["line", "fen"]).doNothing())
    .compile();
  execute(positionsQuery);
}
</script>
