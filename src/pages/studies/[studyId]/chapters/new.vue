<template>
  <BaseContainer>
    <BaseSectionHeading heading="New Chapters" />
    <form @submit.prevent="onSubmit">
      <FieldGroup>
        <Field>
          <FieldLabel for="chapter-name">Chapter Header</FieldLabel>
          <NativeSelect id="chapter-name" v-model="chapterHeader">
            <NativeSelectOption value="White">White</NativeSelectOption>
            <NativeSelectOption value="Black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="line-name">Line Header</FieldLabel>
          <NativeSelect id="line-name" v-model="lineHeader">
            <NativeSelectOption value="">Leave blank</NativeSelectOption>
            <NativeSelectOption value="White">White</NativeSelectOption>
            <NativeSelectOption value="Black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="line-orientation">Line Orientation</FieldLabel>
          <NativeSelect id="line-orientation" v-model="lineOrientation">
            <NativeSelectOption value="white">White</NativeSelectOption>
            <NativeSelectOption value="black">Black</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel for="file-upload">PGNs</FieldLabel>
          <BaseFileUpload v-model="files" :multiple="true" accept=".pgn" />
        </Field>
        <div class="mt-4">
          <Button type="submit">Upload</Button>
        </div>
      </FieldGroup>
    </form>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import { GraduationCap } from "@lucide/vue";
import { db, execute, select, selectFirst } from "@services/database";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { getPositionKey } from "@utilities/move";
import { NormalMove, makeSquare } from "chessops";
import { makeFen } from "chessops/fen";
import { makePgn, parsePgn, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

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
    if (chapterQueryResult.rowsAffected === 0) {
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
    icon: GraduationCap,
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
