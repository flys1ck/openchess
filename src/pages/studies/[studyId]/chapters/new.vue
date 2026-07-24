<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Chapters" />
    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <BaseInputLabel htmlFor="chapter-name" class="block text-sm leading-6 font-medium text-gray-900"
          >Chapter Header</BaseInputLabel
        >
        <select id="chapter-name" v-model="chapterHeader">
          <option value="White">White</option>
          <option value="Black">Black</option>
        </select>
      </div>
      <div>
        <BaseInputLabel htmlFor="line-name" class="block text-sm leading-6 font-medium text-gray-900"
          >Line Header</BaseInputLabel
        >
        <select id="line-name" v-model="lineHeader">
          <option value="">Leave blank</option>
          <option value="White">White</option>
          <option value="Black">Black</option>
        </select>
      </div>
      <div>
        <BaseInputLabel htmlFor="line-orientation" class="block text-sm leading-6 font-medium text-gray-900"
          >Line Orientation</BaseInputLabel
        >
        <select id="line-orientation" v-model="lineOrientation">
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </div>
      <div>
        <BaseInputLabel htmlFor="cover-photo" class="block text-sm leading-6 font-medium text-gray-900"
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
import { db, execute, select, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { getPositionKey } from "@utilities/move";
import { NormalMove, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { makePgn, parsePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { ref } from "vue";
import { useRoute } from "vue-router";

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
  for (const game of games) {
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
    if (chapterQueryResult.rowsAffected === 0 && !chapterQueryResult.lastInsertId) {
      const chapterQuery = db
        .selectFrom("chapters")
        .select("id")
        .where("study", "=", Number(route.params.studyId))
        .where("name", "=", chapterName)
        .compile();
      chapterId = (await selectFirst(chapterQuery)).id;
    } else {
      if (!chapterQueryResult.lastInsertId) throw new Error("Insert succeeded but no lastInsertId returned");
      chapterId = chapterQueryResult.lastInsertId;
    }

    const lineQuery = db
      .insertInto("lines")
      .values({
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
      if (!lineQueryResult.lastInsertId) throw new Error("Insert succeeded but no lastInsertId returned");
      lineId = lineQueryResult.lastInsertId;
    }

    const positions = [];
    for (const node of game.moves.mainline()) {
      const move = parseSan(pos, node.san) as NormalMove;
      if (!move) {
        console.error("mainline includes illegal moves");
        break;
      }
      const fen = makeFen(pos.toSetup());
      positions.push({
        position_key: getPositionKey(fen),
        ply: positions.length,
        halfmove_clock: pos.halfmoves,
        fullmove_number: pos.fullmoves,
        source: makeSquare(move.from),
        destination: makeSquare(move.to),
        san: node.san,
        line: lineId,
      });
      pos.play(move);
    }

    if (positions.length === 0) continue;
    const positionKeys = [...new Set(positions.map((position) => position.position_key))];
    const chessPositionsQuery = db
      .insertInto("chess_positions")
      .values(positionKeys.map((position_key) => ({ position_key })))
      .onConflict((oc) => oc.column("position_key").doNothing())
      .compile();
    await execute(chessPositionsQuery);

    const storedChessPositionsQuery = db
      .selectFrom("chess_positions")
      .select(["id", "position_key"])
      .where("position_key", "in", positionKeys)
      .compile();
    const storedChessPositions = await select(storedChessPositionsQuery);
    const chessPositionIds = new Map(
      storedChessPositions.map((position) => [position.position_key, position.id] as const)
    );

    const positionsQuery = db
      .insertInto("positions")
      .values(
        positions.map(({ position_key, ...position }) => {
          const chessPosition = chessPositionIds.get(position_key);
          if (chessPosition === undefined) throw new Error(`Position key was not stored: ${position_key}`);
          return {
            ...position,
            chess_position: chessPosition,
          };
        })
      )
      .onConflict((oc) => oc.columns(["line", "ply"]).doNothing())
      .compile();
    await execute(positionsQuery);
  }
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
