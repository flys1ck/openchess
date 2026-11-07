<template>
  <Dialog v-model:open="settingsDialog.isOpen">
    <!--
      Fixed height: the study storage chart loads after opening, and a centered dialog would grow and jump.
      Reka would focus the first control, Lichess "Disconnect", where a stray Enter signs the user out.
    -->
    <DialogContent
      class="flex h-[min(calc(100vh-4rem),52rem)] flex-col gap-0 p-0 sm:max-w-3xl"
      @open-auto-focus="
        (event: Event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.focus();
        }
      "
    >
      <DialogHeader class="border-b px-6 py-4">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription class="sr-only">Accounts, sound and study storage.</DialogDescription>
      </DialogHeader>
      <div class="overflow-y-auto px-6 py-6">
        <SettingsSections />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import SettingsSections from "@components/settings/SettingsSections.vue";
import { useSettingsDialog } from "@stores/useSettingsDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const settingsDialog = useSettingsDialog();
</script>
