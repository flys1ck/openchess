<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Chapters" />
    <form class="space-y-4" @submit.prevent="onSubmit">
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
        <BaseInputLabel htmlFor="line-orientation" class="block text-sm font-medium leading-6 text-gray-900"
          >Line Orientation</BaseInputLabel
        >
        <select id="line-orientation" v-model="lineOrientation">
          <option value="white">White</option>
          <option value="black">Black</option>
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
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { db, execute, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { NormalMove, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { makePgn, parsePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { ref } from "vue";
import { definePage, useRoute } from "vue-router/auto";

const route = useRoute("/studies/[studyId]/chapters/new");
const files = ref<File[]>([]);
const chapterHeader = ref("White");
const lineHeader = ref("Black");
const lineOrientation = ref("white");

const query = db.selectFrom("studies").select(["id", "name"]).where("id", "=", Number(route.params.studyId)).compile();
const study = await selectFirst(query);

function onSubmit() {
  files.value.forEach((file) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", (e) => {
      processPgn(e.target?.result as string);
    });
    fileReader.readAsText(file);
  });
}

// TODO: will currently only work with mainline
async function processPgn(pgn: string) {
  const games = parsePgn(pgn);
  games.forEach(async (game) => {
    const pos = startingPosition(game.headers).unwrap();
    const headers = game.headers;
    const chapterName = headers.get(chapterHeader.value) ?? "";
    const lineName = headers.get(lineHeader.value) ?? "";

    let moves = "";
    for (const node of game.moves.mainline()) {
      moves = `${moves} ${node.san}`;
    }

    const chapterQuery = db
      .insertInto("chapters")
      .values({
        name: chapterName,
        study: Number(route.params.studyId),
      })
      .onConflict((oc) => oc.columns(["study", "name"]).doNothing())
      .compile();
    const chapterQueryResult = await execute(chapterQuery);

    let chapterId: number;
    if (chapterQueryResult.rowsAffected === 0) {
      const chapterQuery = db
        .selectFrom("chapters")
        .select("id")
        .where("study", "=", Number(route.params.studyId))
        .where("name", "=", chapterName)
        .compile();
      chapterId = (await selectFirst(chapterQuery)).id;
    } else {
      chapterId = chapterQueryResult.lastInsertId;
    }

    const lineQuery = db
      .insertInto("lines")
      .values({
        study: Number(route.params.studyId),
        chapter: chapterId,
        name: lineName,
        pgn: makePgn(game),
        moves,
        orientation: lineOrientation.value,
      })
      .compile();
    const lineQueryResult = await execute(lineQuery);

    let lineId: number;
    if (lineQueryResult.rowsAffected === 0) {
      const lineQuery = db
        .selectFrom("lines")
        .select("id")
        .where("chapter", "=", chapterId)
        .where("name", "=", lineName)
        .compile();
      lineId = (await selectFirst(lineQuery)).id;
    } else {
      lineId = lineQueryResult.lastInsertId;
    }

    let positions = [];
    for (const node of game.moves.mainline()) {
      const move = parseSan(pos, node.san) as NormalMove;
      if (!move) {
        console.error("mainline includes illegal moves");
        break;
      }
      positions.push({
        fen: makeFen(pos.toSetup()),
        source: makeSquare(move.from),
        destination: makeSquare(move.to),
        san: node.san,
        study: Number(route.params.studyId),
        chapter: chapterId,
        line: lineId,
      });
      pos.play(move);
    }

    if (positions.length === 0) return;
    const positionsQuery = db
      .insertInto("positions")
      .values(positions)
      .onConflict((oc) => oc.columns(["line", "fen"]).doNothing())
      .compile();
    execute(positionsQuery);
  });
}

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Studies",
    to: "/studies/",
  },
  {
    name: study.name,
    to: `/studies/${route.params.studyId}`,
  },
  {
    name: "New Chapters",
    to: `/studies/${route.params.studyId}/chapters/new`,
  },
]);
</script>
