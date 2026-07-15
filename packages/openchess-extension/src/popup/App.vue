<script setup lang="ts">
import { onMounted, ref } from "vue";

const activeTabUrl = ref<string | null>(null);

onMounted(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTabUrl.value = tab?.url ?? null;
});
</script>

<template>
  <main class="w-80 p-4 font-sans text-slate-800 antialiased">
    <h1 class="m-0 text-xl font-normal">OpenChess</h1>
    <p class="mt-1 mb-4 text-sm text-neutral-500">Browser extension development environment</p>

    <section v-if="activeTabUrl" class="rounded-lg border border-neutral-300 p-3">
      <h2 class="mt-0 mb-2 text-sm font-semibold">Active tab</h2>
      <p class="m-0 text-xs break-all text-neutral-700">{{ activeTabUrl }}</p>
    </section>
  </main>
</template>
