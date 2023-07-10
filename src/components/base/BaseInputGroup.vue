<template>
  <div>
    <BaseInputLabel :htmlFor="id">{{ label }}</BaseInputLabel>
    <BaseInput :id="id" :name="label" class="mt-0.5" v-model="modelValue" :type="type" :schema="schema" />
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
  }>(),
  {
    type: "text",
  }
);
</script>
