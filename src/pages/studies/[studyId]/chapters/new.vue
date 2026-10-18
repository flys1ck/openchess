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
import { ImportPlan, Orientation, buildImportPlan } from "@utilities/studyImport";
import { parsePgn } from "chessops/pgn";
import { ref } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

const route = useRoute("/studies/[studyId]/chapters/new");
const files = ref<File[]>([]);
const chapterHeader = ref("White");
const lineHeader = ref("Black");
const lineOrientation = ref<Orientation>("white");

const query = db.selectFrom("studies").select(["id", "name"]).where("id", "=", Number(route.params.studyId)).compile();
const study = await selectFirst(query);

async function onSubmit() {
  const pgns = await Promise.all(files.value.map((file) => file.text()));
  const plan = buildImportPlan(
    pgns.flatMap((pgn) => parsePgn(pgn)),
    {
      chapterHeader: chapterHeader.value,
      lineHeader: lineHeader.value,
      orientation: lineOrientation.value,
    }
  );
  await persistPlan(plan);
}

async function persistPlan(plan: ImportPlan) {
  for (const chapter of plan.chapters) {
    const chapterQuery = db
      .insertInto("chapters")
      .values({
        name: chapter.name,
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
        .where("name", "=", chapter.name)
        .compile();
      chapterId = (await selectFirst(chapterQuery)).id;
    } else {
      if (!chapterQueryResult.lastInsertId) throw new Error("Insert succeeded but no lastInsertId returned");
      chapterId = chapterQueryResult.lastInsertId;
    }

    for (const line of chapter.lines) {
      const lineQuery = db
        .insertInto("lines")
        .values({
          chapter: chapterId,
          name: line.name,
          pgn: line.pgn,
          moves: line.moves,
          orientation: line.orientation,
        })
        .compile();
      const lineQueryResult = await execute(lineQuery);
      const lineId = lineQueryResult.lastInsertId;
      if (!lineId) throw new Error("Insert succeeded but no lastInsertId returned");

      if (line.positions.length === 0) continue;
      const positionKeys = [...new Set(line.positions.map((position) => position.positionKey))];
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
          line.positions.map((position) => {
            const chessPosition = chessPositionIds.get(position.positionKey);
            if (chessPosition === undefined) throw new Error(`Position key was not stored: ${position.positionKey}`);
            return {
              chess_position: chessPosition,
              line: lineId,
              ply: position.ply,
              halfmove_clock: position.halfmoveClock,
              fullmove_number: position.fullmoveNumber,
              source: position.source,
              destination: position.destination,
              san: position.san,
            };
          })
        )
        .onConflict((oc) => oc.columns(["line", "ply"]).doNothing())
        .compile();
      await execute(positionsQuery);
    }
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
