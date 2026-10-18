import { ImportSettings, buildImportPlan, collectHeaders, suggestImportHeaders } from "@utilities/studyImport";
import { Game, PgnNodeData, parsePgn } from "chessops/pgn";
import { computed, reactive, ref, shallowRef, watch } from "vue";

export function useStudyImportPlan() {
  const files = ref<File[]>([]);
  const games = shallowRef<Game<PgnNodeData>[]>([]);
  const settings = reactive<ImportSettings>({ chapterHeader: "", lineHeader: "", orientation: "white" });

  watch(files, async (selectedFiles) => {
    const pgns = await Promise.all(selectedFiles.map((file) => file.text()));
    if (selectedFiles !== files.value) return;
    games.value = pgns.flatMap((pgn) => parsePgn(pgn));
  });

  const headers = computed(() => collectHeaders(games.value));
  watch(headers, (headers) => {
    const names = headers.map((header) => header.name);
    const keepsSelection =
      names.includes(settings.chapterHeader) && (!settings.lineHeader || names.includes(settings.lineHeader));
    if (!keepsSelection) Object.assign(settings, suggestImportHeaders(headers));
  });

  const plan = computed(() => (games.value.length ? buildImportPlan(games.value, { ...settings }) : undefined));
  const lineCount = computed(() => plan.value?.chapters.reduce((sum, chapter) => sum + chapter.lines.length, 0) ?? 0);

  return { files, games, settings, headers, plan, lineCount };
}
