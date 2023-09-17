<template>
  <div class="flex flex-col text-center">
    <h3 class="text-sm font-semibold text-gray-900">No studies</h3>
    <p class="mt-1 text-sm text-gray-500">Get started by creating a new study.</p>
    <div class="mt-6">
      <BaseButton as="RouterLink" to="/studies/new" :prefixIcon="PlusIcon">Create a new study</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon } from "@heroicons/vue/20/solid";

import BaseButton from "../base/BaseButton.vue";
</script>
