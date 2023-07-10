<template>Hi from repo</template>

<script setup lang="ts">
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
    breadcrumb: "Reportoire",
  },
});
</script>
