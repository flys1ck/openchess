<template>
  <div>
    <div class="relative shadow-sm">
      <input
        ref="inputRef"
        v-model="modelValue"
        :id="id"
        :type="type"
        :name="name"
        class="block w-full rounded-md focus:outline-none text-sm py-1.5"
        :class="inputClasses"
      />
      <div v-if="errors?.length" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ExclamationCircleIcon class="h-5 w-5 text-red-500" aria-hidden="true" />
      </div>
    </div>
    <div v-if="errors?.length" class="mt-1">
      <BaseInputFeedbackError v-for="error in errors" :key="error">
        {{ error }}
      </BaseInputFeedbackError>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExclamationCircleIcon } from "@heroicons/vue/20/solid";
import { useEventListener } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { ZodFirstPartySchemaTypes } from "zod";
import BaseInputFeedbackError from "./BaseInputFeedbackError.vue";

const props = withDefaults(
  defineProps<{
    id: string;
    name: string;
    type?: string;
    schema?: ZodFirstPartySchemaTypes;
  }>(),
  {
    type: "text",
  }
);

const modelValue = defineModel<string>({ default: "" });
const shouldValidate = ref<boolean>(false);

const errors = computed(() => {
  if (!props.schema || !shouldValidate.value) return;
  const validationResult = props.schema.safeParse(modelValue.value);
  if (validationResult.success) return;
  return validationResult.error.issues.map((issue) => issue.message);
});

const inputClasses = computed(() => ({
  "border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500/50": !errors.value,
  "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/50 pr-10": errors.value,
}));

const inputRef = ref<HTMLInputElement>();
const cleanup = useEventListener(inputRef, "change", () => {
  shouldValidate.value = true;
  cleanup();
});

onMounted(() => {
  // trigger validation, when form containing input is submitted
  if (!inputRef.value?.form) return;
  useEventListener(inputRef.value.form, "submit", () => {
    shouldValidate.value = true;
  });
});
</script>
