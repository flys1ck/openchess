<template>
  <Suspense>
    <LichessGame />
  </Suspense>
</template>

<script setup lang="ts">
import LichessGame from "@components/games/LichessGame.vue";
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
