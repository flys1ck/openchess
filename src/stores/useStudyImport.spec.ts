import { ImportPlan, PlannedLine } from "@utilities/studyImport";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "vue-sonner";
import { useStudyImport } from "./useStudyImport";

type InvokeArgs = { onProgress: { onmessage: (message: unknown) => void } };
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn<(command: string, args: InvokeArgs) => Promise<number>>() }));

vi.mock("@tauri-apps/api/core", () => ({
  invoke,
  Channel: class {
    onmessage: (message: unknown) => void = () => {};
  },
}));
vi.mock("vue-sonner", () => ({
  toast: { loading: vi.fn<() => string>(() => "toast-id"), success: vi.fn<() => void>(), error: vi.fn<() => void>() },
}));
vi.mock("@components/studies/StudyImportProgress.vue", () => ({ default: {} }));

function line(name: string): PlannedLine {
  return { name, pgn: "", moves: "", orientation: "white", positions: [], warnings: [] };
}

const plan: ImportPlan = {
  chapters: [
    { name: "Chapter 1", lines: [line("A"), line("B")] },
    { name: "Chapter 2", lines: [line("C")] },
  ],
  warnings: [],
};

function deferredInvoke() {
  let resolve!: (studyId: number) => void;
  let reject!: (error: unknown) => void;
  let sendProgress!: (importedLines: number) => void;
  invoke.mockImplementationOnce(
    (_command, args) =>
      new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
        sendProgress = (importedLines) => args.onProgress.onmessage({ importedLines, totalLines: 3 });
      })
  );
  return {
    resolve: (studyId: number) => resolve(studyId),
    reject: (error: unknown) => reject(error),
    sendProgress: (importedLines: number) => sendProgress(importedLines),
  };
}

describe("useStudyImport", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("tracks progress in the job and finishes the toast", async () => {
    const studyImport = useStudyImport();
    const command = deferredInvoke();

    const result = studyImport.start({ type: "existingStudy", id: 7 }, plan, "Janowski");

    expect(invoke).toHaveBeenCalledWith(
      "import_study",
      expect.objectContaining({ target: { type: "existingStudy", id: 7 }, plan })
    );
    expect(toast.loading).toHaveBeenCalledWith("Importing into Janowski", expect.anything());
    expect(studyImport.job).toEqual({ studyId: 7, studyName: "Janowski", importedLines: 0, totalLines: 3 });

    command.sendProgress(2);
    expect(studyImport.job?.importedLines).toBe(2);

    command.resolve(7);
    await expect(result).resolves.toBe(7);
    expect(toast.success).toHaveBeenCalledWith("Imported 3 lines into Janowski", {
      id: "toast-id",
      description: undefined,
    });
    expect(studyImport.job).toBeUndefined();
  });

  it("shows the error in the toast and clears the job when the import fails", async () => {
    const studyImport = useStudyImport();
    const command = deferredInvoke();

    const result = studyImport.start({ type: "existingStudy", id: 7 }, plan, "Janowski");
    command.reject("UNIQUE constraint failed: studies.name");

    await expect(result).resolves.toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith("Couldn't import into Janowski", {
      id: "toast-id",
      description: "UNIQUE constraint failed: studies.name",
    });
    expect(studyImport.job).toBeUndefined();
  });

  it("has no study id until a new study is created", () => {
    const studyImport = useStudyImport();
    deferredInvoke();

    void studyImport.start({ type: "newStudy", name: "Janowski", description: null }, plan, "Janowski");

    expect(studyImport.job?.studyId).toBeUndefined();
  });

  it("rejects a second import while one is running", async () => {
    const studyImport = useStudyImport();
    deferredInvoke();

    void studyImport.start({ type: "existingStudy", id: 7 }, plan, "Janowski");

    await expect(studyImport.start({ type: "existingStudy", id: 8 }, plan, "Other")).rejects.toThrow(
      "Another import is still running"
    );
    expect(invoke).toHaveBeenCalledTimes(1);
  });
});
