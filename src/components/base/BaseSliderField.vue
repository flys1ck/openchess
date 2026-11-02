<template>
  <Field>
    <div class="flex items-center justify-between">
      <Label>{{ label }}</Label>
      <span class="text-muted-foreground text-sm">{{ model[0] }}{{ unit }}</span>
    </div>
    <Slider
      :thumb-label="label"
      :min="min"
      :max="max"
      :step="step"
      v-model="model"
      @value-commit="emit('valueCommit')"
    />
  </Field>
</template>

<script setup lang="ts">
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

defineProps<{
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}>();

const emit = defineEmits<{
  valueCommit: [];
}>();

const model = defineModel<[number]>({ required: true });
</script>
