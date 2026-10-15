<template>
  <div>
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10">
      <Upload class="text-muted-foreground size-12" />
      <div class="text-muted-foreground mt-4 flex text-sm leading-6">
        <label
          for="file-upload"
          class="text-primary focus-within:ring-ring/50 relative cursor-pointer rounded-md font-semibold focus-within:ring-3 focus-within:outline-hidden hover:underline"
        >
          Upload files
          <input
            ref="fileInputRef"
            :accept="accept"
            id="file-upload"
            name="file-upload"
            type="file"
            class="sr-only"
            :multiple="multiple"
            @change="onUpload"
          />
        </label>
        <p class="pl-1">or drag and drop</p>
      </div>
      <p class="text-muted-foreground text-xs leading-5">PGN up to 10MB</p>
    </div>
    <template v-if="files?.length">
      <div class="mt-2 space-x-2 text-sm">
        <span>{{ files.length }} File(s)</span><span>{{ totalUploadSize }}</span>
      </div>
      <ul class="mt-2 max-h-96 space-y-2 overflow-auto rounded-lg">
        <li v-for="file in files" :key="file.name" class="bg-muted flex items-center justify-between rounded-lg p-4">
          <div class="flex items-center gap-2">
            <FileText class="text-primary size-8" />
            <div>
              <div class="text-sm font-semibold">{{ file.name }}</div>
              <div class="text-muted-foreground text-xs leading-5">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            :aria-label="`Remove ${file.name} from file upload`"
            @click="removeFile(file.name)"
          >
            <X />
          </Button>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { FileText, Upload, X } from "@lucide/vue";
import { formatFileSize } from "@utilities/fileSize";
import { computed, ref } from "vue";
import { Button } from "@/components/ui/button";

defineProps<{
  accept?: string;
  multiple?: boolean;
  modelValue: File[];
}>();

const emit = defineEmits<{
  "update:modelValue": [files: File[]];
}>();

const fileInputRef = ref<HTMLInputElement>();
const files = ref<File[]>();

function onUpload(e: Event) {
  const fileList = (e.target as HTMLInputElement).files;
  if (!fileList) return;

  files.value = [...fileList];
  emit("update:modelValue", files.value);
}

function removeFile(fileName: string) {
  if (!fileInputRef.value || !files.value) return;

  const dataTransfer = new DataTransfer();
  const filteredFiles = files.value?.filter((file) => file.name !== fileName);
  filteredFiles.forEach((file) => {
    dataTransfer.items.add(file);
  });

  fileInputRef.value.files = dataTransfer.files;
  files.value = filteredFiles;
  emit("update:modelValue", files.value);
}

const totalUploadSize = computed(() => {
  if (!files.value || !files.value.length) return "";
  const totalUploadSizeInBytes = [...files.value].reduce((acc, file) => {
    return acc + file.size;
  }, 0);

  return formatFileSize(totalUploadSizeInBytes);
});
</script>
