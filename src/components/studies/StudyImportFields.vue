<template>
  <Field>
    <FieldLabel for="file-upload">PGN files</FieldLabel>
    <BaseFileUpload v-model="files" :multiple="true" accept=".pgn" />
  </Field>
  <template v-if="headers.length">
    <Field>
      <FieldLabel for="chapter-header">Chapter names from</FieldLabel>
      <NativeSelect id="chapter-header" v-model="settings.chapterHeader">
        <NativeSelectOption v-for="header in headers" :key="header.name" :value="header.name">
          {{ header.name }} · {{ header.count }} games
        </NativeSelectOption>
      </NativeSelect>
    </Field>
    <Field>
      <FieldLabel for="line-header">Line names from</FieldLabel>
      <NativeSelect id="line-header" v-model="settings.lineHeader">
        <NativeSelectOption value="">Number lines in each chapter</NativeSelectOption>
        <NativeSelectOption v-for="header in headers" :key="header.name" :value="header.name">
          {{ header.name }} · {{ header.count }} games
        </NativeSelectOption>
      </NativeSelect>
    </Field>
    <Field>
      <FieldLabel for="line-orientation">Line orientation</FieldLabel>
      <NativeSelect id="line-orientation" v-model="settings.orientation">
        <NativeSelectOption value="white">White</NativeSelectOption>
        <NativeSelectOption value="black">Black</NativeSelectOption>
      </NativeSelect>
    </Field>
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel for="split-variations">One line per variation</FieldLabel>
        <FieldDescription>Import every sideline as its own line instead of only the main line.</FieldDescription>
      </FieldContent>
      <Switch id="split-variations" v-model="settings.splitVariations" />
    </Field>
  </template>
  <StudyImportPreview v-if="plan" :plan="plan" :existing-lines="existingLines" />
</template>

<script setup lang="ts">
import BaseFileUpload from "@components/base/BaseFileUpload.vue";
import { HeaderSummary, ImportPlan, ImportSettings } from "@utilities/studyImport";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import StudyImportPreview from "./StudyImportPreview.vue";

defineProps<{
  headers: HeaderSummary[];
  plan?: ImportPlan;
  existingLines?: Map<string, Set<string>>;
}>();
const files = defineModel<File[]>("files", { required: true });
const settings = defineModel<ImportSettings>("settings", { required: true });
</script>
