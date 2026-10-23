<template>
  <Collapsible v-model:open="open" as="li" role="treeitem" :aria-expanded="open">
    <div class="group/chapter hover:bg-muted relative flex items-center rounded-md">
      <CollapsibleTrigger
        class="focus-visible:ring-ring/50 flex min-w-0 grow items-center gap-1.5 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-3"
      >
        <ChevronRight
          class="text-muted-foreground size-4 shrink-0 transition-transform"
          :class="{ 'rotate-90': open }"
        />
        <span class="truncate font-medium" :title="chapter.name">{{ chapter.name }}</span>
        <span
          class="text-muted-foreground ml-auto shrink-0 pl-2 text-xs tabular-nums group-hover/chapter:invisible group-has-[a:focus-visible]/chapter:invisible"
        >
          {{ chapter.line_count }}
        </span>
      </CollapsibleTrigger>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon-xs"
            class="absolute right-1 opacity-0 group-hover/chapter:opacity-100 focus-visible:opacity-100"
            as-child
          >
            <RouterLink :to="`/studies/${studyId}/chapters/${chapter.id}/edit`" aria-label="Edit chapter">
              <Pencil />
            </RouterLink>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit chapter</TooltipContent>
      </Tooltip>
    </div>
    <CollapsibleContent>
      <ul ref="lineList" role="group" class="ml-4 border-l pl-2">
        <template v-if="lines">
          <li v-for="line in lines" :key="line.id" role="treeitem">
            <RouterLink
              :to="`/studies/${studyId}/chapters/${chapter.id}/lines/${line.id}`"
              class="focus-visible:ring-ring/50 flex flex-col rounded-md px-2 py-1 outline-none focus-visible:ring-3"
              :class="line.id === activeLineId ? 'bg-primary/15 text-foreground' : 'hover:bg-muted'"
              :data-active="line.id === activeLineId || undefined"
            >
              <span class="truncate" :class="{ 'font-medium': line.id === activeLineId }">{{ line.name }}</span>
              <span v-if="line.preview" class="text-muted-foreground truncate text-xs">{{ line.preview }}</span>
            </RouterLink>
          </li>
          <li v-if="!lines.length" class="text-muted-foreground px-2 py-1 text-xs italic">No lines</li>
        </template>
        <template v-else>
          <li v-for="index in Math.min(chapter.line_count, 5)" :key="index" class="flex flex-col gap-1 px-2 py-1.5">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-3 w-1/2" />
          </li>
        </template>
      </ul>
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ChevronRight, Pencil } from "@lucide/vue";
import { db, select } from "@services/database";
import { getLinePreviews } from "@utilities/linePreview";
import { sql } from "kysely";
import { shallowRef, useTemplateRef, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LineRow {
  id: number;
  name: string;
  preview: string;
}

const props = defineProps<{
  studyId: number;
  chapter: { id: number; name: string; line_count: number };
  activeLineId?: number;
}>();
const open = defineModel<boolean>("open", { default: false });

const lines = shallowRef<LineRow[]>();
const lineList = useTemplateRef("lineList");

async function loadLines() {
  const query = db
    .selectFrom("lines")
    .select([
      "id",
      "name",
      "moves",
      // Only the FEN tag, so the tree never loads whole PGNs
      sql<string | null>`case when instr(pgn, '[FEN "') > 0 then substr(pgn, instr(pgn, '[FEN "') + 6, 100) end`.as(
        "fen_tag"
      ),
    ])
    .where("chapter", "=", props.chapter.id)
    .orderBy("id")
    .compile();
  const rows = await select(query);
  const previews = getLinePreviews(
    rows.map((row) => ({ moves: row.moves, startFen: row.fen_tag?.slice(0, row.fen_tag.indexOf('"')) }))
  );
  lines.value = rows.map((row, i) => ({ id: row.id, name: row.name, preview: previews[i] }));
}

watch(
  open,
  (isOpen) => {
    if (isOpen && !lines.value) loadLines();
  },
  { immediate: true }
);

watch(
  [lines, () => props.activeLineId],
  () => lineList.value?.querySelector("[data-active]")?.scrollIntoView({ block: "nearest" }),
  { flush: "post" }
);
</script>
