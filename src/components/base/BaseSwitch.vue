<template>
  <SwitchGroup as="div" class="flex items-center">
    <Switch
      v-model="modelValue"
      class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2"
      :class="modelValue ? 'bg-orange-400' : 'bg-gray-200'"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </Switch>
    <SwitchLabel v-if="label" as="span" class="ml-3">
      <span class="text-sm font-medium text-gray-900">{{ label }}</span>
    </SwitchLabel>
  </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";

defineProps<{
  label?: string;
}>();

const modelValue = defineModel();
</script>
