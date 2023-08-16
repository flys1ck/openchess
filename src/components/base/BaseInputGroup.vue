<template>
  <div>
    <BaseInputLabel :htmlFor="id">{{ label }}</BaseInputLabel>
    <BaseInput
      :id="id"
      :name="label"
      class="mt-0.5"
      v-model="modelValue"
      :type="type"
      :schema="schema"
      :async-schema="asyncSchema"
    />
  </div>
</template>

<script setup lang="ts">
import { ZodFirstPartySchemaTypes } from "zod";
import BaseInput from "./BaseInput.vue";
import BaseInputLabel from "./BaseInputLabel.vue";

const id = `input-${crypto.randomUUID()}`;
const modelValue = defineModel<string>({ default: "" });

withDefaults(
  defineProps<{
    label: string;
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
</script>
