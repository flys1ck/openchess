<template>
  <div v-if="job" class="flex w-full flex-col gap-1.5">
    <Progress :model-value="job.totalLines ? (job.importedLines / job.totalLines) * 100 : 0" />
    <p class="text-muted-foreground text-xs tabular-nums">{{ job.importedLines }} / {{ job.totalLines }} lines</p>
  </div>
</template>

<script setup lang="ts">
import { useStudyImport } from "@stores/useStudyImport";
import { storeToRefs } from "pinia";
import { Progress } from "@/components/ui/progress";

const { job } = storeToRefs(useStudyImport());
</script>
