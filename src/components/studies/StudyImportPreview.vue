<template>
  <section class="flex flex-col gap-3" aria-label="Import preview">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-sm font-medium">Preview</h3>
      <p class="text-muted-foreground text-xs tabular-nums">
        {{ pluralize(plan.chapters.length, "chapter") }} · {{ pluralize(lineCount, "line") }}
        <template v-if="existingLines"> · {{ replacedCount }} replaced</template>
      </p>
    </div>
    <ul v-if="plan.warnings.length" class="flex flex-col gap-1 text-xs">
      <li v-for="warning in plan.warnings" :key="warning" class="flex items-center gap-1.5 text-amber-600">
        <TriangleAlert class="size-3.5 shrink-0" />
        {{ warning }}
      </li>
    </ul>
    <ul
      v-if="plan.chapters.length"
      role="tree"
      class="bg-card max-h-[32rem] overflow-auto rounded-lg border p-1.5 text-sm"
    >
      <Collapsible v-for="chapter in plan.chapters" :key="chapter.name" v-slot="{ open }" as="li" role="treeitem">
        <CollapsibleTrigger
          class="hover:bg-muted focus-visible:ring-ring/50 flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left outline-none focus-visible:ring-3"
        >
          <ChevronRight
            class="text-muted-foreground size-4 shrink-0 transition-transform"
            :class="{ 'rotate-90': open }"
          />
          <FolderOpen v-if="open" class="text-primary size-4 shrink-0" />
          <Folder v-else class="text-primary size-4 shrink-0" />
          <span class="truncate" :class="{ 'text-muted-foreground italic': !chapter.name }">
            {{ chapter.name || "Unnamed chapter" }}
          </span>
          <Badge v-if="existingLines" :variant="existingLines.has(chapter.name) ? 'secondary' : 'outline'">
            {{ existingLines.has(chapter.name) ? "Merged" : "New" }}
          </Badge>
          <TriangleAlert
            v-if="chapter.lines.some((line) => line.warnings.length)"
            class="size-3.5 shrink-0 text-amber-600"
            aria-label="Has warnings"
          />
          <span class="text-muted-foreground ml-auto shrink-0 pl-2 text-xs tabular-nums">
            {{ pluralize(chapter.lines.length, "line") }}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul role="group" class="ml-4 border-l pl-2">
            <li v-for="line in chapter.lines" :key="line.name" role="treeitem" class="rounded-md px-2 py-1">
              <div class="flex items-center gap-1.5">
                <FileText class="text-muted-foreground size-4 shrink-0" />
                <span class="truncate">{{ line.name }}</span>
                <Badge v-if="existingLines?.get(chapter.name)?.has(line.name)" variant="secondary">Replaces</Badge>
                <span class="text-muted-foreground ml-auto shrink-0 pl-2 text-xs tabular-nums">
                  {{ line.positions.length ? pluralize(Math.ceil(line.positions.length / 2), "move") : "No moves" }}
                </span>
              </div>
              <p
                v-for="warning in line.warnings"
                :key="warning"
                class="ml-5.5 flex items-center gap-1.5 text-xs text-amber-600"
              >
                <TriangleAlert class="size-3 shrink-0" />
                {{ warning }}
              </p>
            </li>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight, FileText, Folder, FolderOpen, TriangleAlert } from "@lucide/vue";
import { ImportPlan } from "@utilities/studyImport";
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const props = defineProps<{
  plan: ImportPlan;
  existingLines?: Map<string, Set<string>>;
}>();

const lineCount = computed(() => props.plan.chapters.reduce((sum, chapter) => sum + chapter.lines.length, 0));
const replacedCount = computed(() =>
  props.plan.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lines.filter((line) => props.existingLines?.get(chapter.name)?.has(line.name)).length,
    0
  )
);

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
</script>
