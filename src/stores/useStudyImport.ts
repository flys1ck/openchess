import StudyImportProgress from "@components/studies/StudyImportProgress.vue";
import { ImportTarget, importStudy } from "@services/studyImport";
import { ImportPlan } from "@utilities/studyImport";
import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import { toast } from "vue-sonner";

export interface StudyImportJob {
  studyId?: number;
  studyName: string;
  importedLines: number;
  totalLines: number;
}

export const useStudyImport = defineStore("studyImport", () => {
  const job = ref<StudyImportJob>();

  async function start(target: ImportTarget, plan: ImportPlan, studyName: string) {
    if (job.value) throw new Error("Another import is still running");

    const totalLines = plan.chapters.reduce((sum, chapter) => sum + chapter.lines.length, 0);
    job.value = {
      studyId: target.type === "existingStudy" ? target.id : undefined,
      studyName,
      importedLines: 0,
      totalLines,
    };
    const toastId = toast.loading(`Importing into ${studyName}`, { description: markRaw(StudyImportProgress) });

    try {
      const studyId = await importStudy(target, plan, (progress) => {
        if (job.value) job.value.importedLines = progress.importedLines;
      });
      toast.success(`Imported ${totalLines} lines into ${studyName}`, { id: toastId, description: undefined });
      return studyId;
    } catch (error) {
      toast.error(`Couldn't import into ${studyName}`, { id: toastId, description: String(error) });
    } finally {
      job.value = undefined;
    }
  }

  return { job, start };
});
