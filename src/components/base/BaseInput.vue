<template>
  <div>
    <div class="relative shadow-sm">
      <input
        ref="inputRef"
        v-model="modelValue"
        :id="id"
        :type="type"
        :name="name"
        class="block w-full rounded-md py-1.5 text-sm focus:outline-none"
        :class="inputClasses"
      />
      <div
        v-if="errors.length || isEvaluating"
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
      >
        <ExclamationCircleIcon v-if="!isEvaluating" class="h-5 w-5 text-red-500" aria-hidden="true" />
        <MinusIcon v-if="isEvaluating" class="h-5 w-5 animate-spin text-blue-500" />
      </div>
    </div>
    <div v-if="errors.length" class="mt-1">
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
import { MinusIcon } from "@heroicons/vue/24/solid";

const props = withDefaults(
  defineProps<{
    id: string;
    name: string;
    type?: string;
    schema?: ZodFirstPartySchemaTypes;
    /**
     * Async schema, when the value requires async validation The value will
     * only be validated against `asyncSchema`, when `schema` passes validation.
     */
    asyncSchema?: ZodFirstPartySchemaTypes;
  }>(),
  {
    type: "text",
  }
);

const errors = ref<string[]>([]);
const isEvaluating = ref(false);
const modelValue = defineModel<string>({ default: "" });

async function validate() {
  if (!props.schema && !props.asyncSchema) return [];
  if (props.schema) {
    const validationResult = props.schema.safeParse(modelValue.value);
    if (!validationResult.success) return validationResult.error.issues.map((issue) => issue.message);
  }
  if (props.asyncSchema) {
    isEvaluating.value = true;
    const validationResult = await props.asyncSchema.safeParseAsync(modelValue.value);
    isEvaluating.value = false;
    if (validationResult.success) return [];
    return validationResult.error.issues.map((issue) => issue.message);
  }
  return [];
}

const inputClasses = computed(() => ({
  "border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500/50": !errors.value.length,
  "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/50 pr-10":
    errors.value.length,
}));

const inputRef = ref<HTMLInputElement>();
if (!props.asyncSchema) {
  const cleanup = useEventListener(inputRef, "change", () => {
    validate();
    cleanup();
  });
}

onMounted(() => {
  // trigger validation, when form containing input is submitted
  if (!inputRef.value?.form) return;
  useEventListener(inputRef.value.form, "submit", async () => {
    errors.value = await validate();
  });
});
</script>
