import { confirm } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { toast } from "vue-sonner";

export async function checkForAppUpdate(): Promise<void> {
  let update;
  try {
    update = await check();
  } catch {
    return;
  }

  if (!update) return;

  const message = update.body
    ? `Version ${update.version} is available.\n\n${update.body}`
    : `Version ${update.version} is available. Install now?`;

  const shouldInstall = await confirm(message, { title: "Update OpenChess", kind: "info" });
  if (!shouldInstall) return;

  try {
    await update.downloadAndInstall();
    await relaunch();
  } catch (error) {
    toast.error("Update failed", {
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
