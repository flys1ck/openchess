<template>
  <div>
    <div
      class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10"
    >
      <PhotoIcon class="w-12 h-12 text-gray-400" />
      <div class="mt-4 flex text-sm leading-6 text-gray-600">
        <label
          for="file-upload"
          class="relative cursor-pointer rounded-md font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500"
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
      <p class="text-xs leading-5 text-gray-600">PGN up to 10MB</p>
    </div>
    <template v-if="files?.length">
      <div class="mt-2 space-x-2">
        <span>{{ files.length }} File(s)</span><span>{{ totalUploadSize }}</span>
      </div>
      <ul class="space-y-2 max-h-48 overflow-auto shadow-inner mt-2 rounded-lg">
        <li v-for="file in files" :key="file.name" class="bg-gray-100 p-4 flex items-center rounded-lg justify-between">
          <div class="flex gap-2 items-center">
            <DocumentIcon class="w-8 h-8 text-orange-400" />
            <div>
              <div class="text-sm font-semibold">{{ file.name }}</div>
              <div class="text-xs text-gray-400 leading-5">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
          <BaseButton
            :prefixIcon="XMarkIcon"
            variant="ghost"
            :aria-label="`Remove ${file.name} from file upload`"
            @click="removeFile(file.name)"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
import { DocumentIcon } from "@heroicons/vue/24/outline";
import { PhotoIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { computed, ref } from "vue";
import BaseButton from "./BaseButton.vue";

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1048576) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const totalUploadSize = computed(() => {
  if (!files.value || !files.value.length) return "";

  const totalUploadSizeInBytes = [...files.value].reduce((acc, file) => {
    return acc + file.size;
  }, 0);

  return formatFileSize(totalUploadSizeInBytes);
});
</script>
