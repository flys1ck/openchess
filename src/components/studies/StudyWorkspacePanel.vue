<template>
  <aside class="flex flex-col overflow-hidden text-sm" aria-label="Chapters and lines">
    <div class="flex flex-col gap-3 border-b p-3">
      <Skeleton v-if="!study" class="h-6 w-3/4" />
      <h1 v-else class="line-clamp-2 text-base leading-snug font-semibold" :title="study.name">{{ study.name }}</h1>
      <div class="flex items-center gap-2">
        <Button v-if="studyImport.job" size="sm" variant="outline" disabled>
          <FileUp data-icon="inline-start" />Import PGN
        </Button>
        <Button v-else size="sm" variant="outline" as-child>
          <RouterLink :to="`/studies/${studyId}/import`"><FileUp data-icon="inline-start" />Import PGN</RouterLink>
        </Button>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button size="icon-sm" variant="outline" as-child>
              <RouterLink :to="`/studies/${studyId}/edit`" aria-label="Edit study"><Pencil /></RouterLink>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit study</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon-sm"
              variant="ghost"
              class="ml-auto"
              aria-label="Hide chapters"
              @click="$emit('collapse')"
            >
              <PanelLeftClose />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hide chapters</TooltipContent>
        </Tooltip>
      </div>
      <div v-if="isImporting" class="flex flex-col gap-2">
        <p class="text-xs font-medium">Importing lines…</p>
        <StudyImportProgress />
      </div>
    </div>
    <div class="grow overflow-y-auto p-1.5">
      <ul v-if="!chapters" class="flex flex-col gap-1">
        <li v-for="index in 8" :key="index" class="px-2 py-1.5"><Skeleton class="h-4 w-full" /></li>
      </ul>
      <p v-else-if="!chapters.length" class="text-muted-foreground p-2 text-xs italic">No chapters yet</p>
      <ul v-else :key="chapterListKey" role="tree">
        <StudyChapterItem
          v-for="chapter in chapters"
          :key="chapter.id"
          :study-id="studyId"
          :chapter="chapter"
          :active-line-id="lineId"
          :open="openChapterIds.has(chapter.id)"
          @update:open="(open) => toggleChapter(chapter.id, open)"
        />
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import StudyChapterItem from "@components/studies/StudyChapterItem.vue";
import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import { FileUp, PanelLeftClose, Pencil } from "@lucide/vue";
import { db, select, selectFirst } from "@services/database";
import { useStudyImport } from "@stores/useStudyImport";
import { computed, ref, shallowRef, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const props = defineProps<{
  studyId: number;
  chapterId?: number;
  lineId?: number;
}>();
defineEmits<{
  collapse: [];
}>();

const study = shallowRef<{ id: number; name: string }>();
const chapters = shallowRef<{ id: number; name: string; line_count: number }[]>();
const openChapterIds = ref(new Set<number>());
const chapterListKey = ref(0);

const studyImport = useStudyImport();
const isImporting = computed(() => studyImport.job?.studyId === props.studyId);

async function loadStudy() {
  const studyQuery = db.selectFrom("studies").select(["id", "name"]).where("id", "=", props.studyId).compile();
  const chapterQuery = db
    .selectFrom("chapters")
    .leftJoin("lines", "lines.chapter", "chapters.id")
    .select(({ fn }) => ["chapters.id", "chapters.name", fn.count<number>("lines.id").as("line_count")])
    .where("chapters.study", "=", props.studyId)
    .groupBy("chapters.id")
    .orderBy("chapters.id")
    .compile();
  [study.value, chapters.value] = await Promise.all([selectFirst(studyQuery), select(chapterQuery)]);
}

function toggleChapter(chapterId: number, open: boolean) {
  if (open) openChapterIds.value.add(chapterId);
  else openChapterIds.value.delete(chapterId);
}

watch(() => props.studyId, loadStudy, { immediate: true });

watch(
  () => props.chapterId,
  (chapterId) => {
    if (chapterId) openChapterIds.value.add(chapterId);
  },
  { immediate: true }
);

// Remounting the chapter items makes the open ones fetch their lines again
watch(isImporting, async (importing) => {
  if (importing) return;
  await loadStudy();
  chapterListKey.value++;
});
</script>
