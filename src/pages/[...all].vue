<template>Whoopsie, this does not exist.</template>

<script setup lang="ts">
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useRoute } from "vue-router";

const route = useRoute("/[...all]");
const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([{ name: "Page not found", to: route.path }]);
</script>
