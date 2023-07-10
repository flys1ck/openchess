import { invoke } from "@tauri-apps/api";

export async function beginEvaluation(fen: string) {
  await invoke("begin_evaluation", { fen });
}

export async function stopEvaluation() {
  await invoke("stop_evaluation");
}
