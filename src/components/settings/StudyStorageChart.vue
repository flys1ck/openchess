<template>
  <div class="space-y-4">
    <figure v-if="studies.length">
      <figcaption class="sr-only">Stored content size for each study</figcaption>
      <ul role="list" class="space-y-4">
        <li v-for="study in studies" :key="study.id">
          <div class="flex items-baseline justify-between gap-4 text-sm">
            <span class="truncate text-gray-900">{{ study.name }}</span>
            <span class="shrink-0 text-gray-500">{{ formatFileSize(study.size_bytes) }}</span>
          </div>
          <div class="mt-1 h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <div
              class="h-full min-w-1 rounded-full bg-gray-300"
              :style="{ width: `${getBarWidth(study.size_bytes)}%` }"
            />
          </div>
        </li>
      </ul>
    </figure>
    <p v-else class="text-sm text-gray-500">Create a study to see its stored content size.</p>
    <dl class="flex items-baseline justify-between gap-4 rounded-lg bg-gray-50 py-3 text-sm font-medium">
      <dt class="text-gray-700">Total database size</dt>
      <dd class="text-gray-900">{{ formatFileSize(databaseSize) }}</dd>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { db, select } from "@services/database";
import { formatFileSize } from "@utilities/fileSize";
import { sql } from "kysely";

interface StudyStorage {
  id: number;
  name: string;
  size_bytes: number;
}

interface DatabaseStorage {
  size_bytes: number;
}

const databaseStorageQuery = sql<DatabaseStorage>`
  select page_count * page_size as size_bytes
  from pragma_page_count(), pragma_page_size()
`.compile(db);

const studyStorageQuery = sql<StudyStorage>`
  with study_content(study_id, size_bytes) as (
    select
      studies.id,
      length(cast(studies.created_at as blob))
        + length(cast(studies.name as blob))
        + length(cast(coalesce(studies.description, '') as blob))
    from studies

    union all

    select
      chapters.study,
      length(cast(chapters.created_at as blob))
        + length(cast(chapters.name as blob))
    from chapters

    union all

    select
      chapters.study,
      length(cast(lines.created_at as blob))
        + length(cast(lines.name as blob))
        + length(cast(lines.pgn as blob))
        + length(cast(lines.moves as blob))
        + length(cast(lines.orientation as blob))
    from lines
    inner join chapters on chapters.id = lines.chapter

    union all

    select
      chapters.study,
      length(cast(positions.created_at as blob))
        + length(cast(positions.ply as blob))
        + length(cast(positions.halfmove_clock as blob))
        + length(cast(positions.fullmove_number as blob))
        + length(cast(positions.san as blob))
        + length(cast(positions.source as blob))
        + length(cast(positions.destination as blob))
    from positions
    inner join lines on lines.id = positions.line
    inner join chapters on chapters.id = lines.chapter

    union all

    select
      study_positions.study,
      length(cast(study_positions.position_key as blob))
    from (
      select distinct
        chapters.study,
        chess_positions.id,
        chess_positions.position_key
      from positions
      inner join chess_positions on chess_positions.id = positions.chess_position
      inner join lines on lines.id = positions.line
      inner join chapters on chapters.id = lines.chapter
    ) as study_positions
  )
  select
    studies.id,
    studies.name,
    cast(coalesce(sum(study_content.size_bytes), 0) as integer) as size_bytes
  from studies
  left join study_content on study_content.study_id = studies.id
  group by studies.id, studies.name
  order by size_bytes desc, studies.name asc
`.compile(db);

const [databaseStorage, studies] = await Promise.all([select(databaseStorageQuery), select(studyStorageQuery)]);
const databaseSize = databaseStorage[0]?.size_bytes ?? 0;
const largestStudySize = studies[0]?.size_bytes ?? 0;

function getBarWidth(size: number) {
  if (largestStudySize === 0) return 0;
  return (size / largestStudySize) * 100;
}
</script>
