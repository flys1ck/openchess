<template>
  <div>
    <div class="relative shadow-xs">
      <input
        ref="inputRef"
        v-model="modelValue"
        :id="id"
        :type="resolvedType"
        :name="name"
        class="block w-full rounded-md py-1.5 text-sm focus-within:ring-2 focus:outline-hidden"
        :class="inputClasses"
        spellcheck="false"
      />
      <div
        v-if="props.type === 'password' || errors.length || isEvaluating"
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-x-1 pr-2.5"
      >
        <span v-if="errors.length || isEvaluating">
          <ExclamationCircleIcon v-if="!isEvaluating" class="size-5 text-red-500" aria-hidden="true" />
          <MinusIcon v-if="isEvaluating" class="size-5 animate-spin text-blue-500" />
        </span>
        <button
          v-if="props.type === 'password'"
          type="button"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          class="pointer-events-auto rounded-md p-0.5 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-amber-500/50 focus:outline-hidden"
        >
          <EyeSlashIcon v-if="showPassword" class="size-5" aria-hidden="true" />
          <EyeIcon v-else class="size-5" aria-hidden="true" />
        </button>
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
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import { MinusIcon } from "@heroicons/vue/24/solid";
import { useEventListener } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import { ZodType } from "zod";
import BaseInputFeedbackError from "./BaseInputFeedbackError.vue";

const props = withDefaults(
  defineProps<{
    id: string;
    name: string;
    type?: string;
    schema?: ZodType;
    /**
     * Async schema, when the value requires async validation The value will only be validated against `asyncSchema`,
     * when `schema` passes validation.
     */
    asyncSchema?: ZodType;
  }>(),
  {
    type: "text",
  }
);

const errors = ref<string[]>([]);
const isEvaluating = ref(false);
const modelValue = defineModel<string>({ default: "" });
const showPassword = ref(false);
const resolvedType = computed(() => (props.type === "password" && showPassword.value ? "text" : props.type));

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
  "border-gray-300 shadow-xs focus-within:ring-orange-500/50": !errors.value.length,
  "border-red-300 placeholder-red-300 focus-within:border-red-500 focus-within:ring-red-500/50 pr-10":
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
