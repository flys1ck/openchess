<template>
  <BaseContainer class="overflow-y-auto">
    <BaseSectionHeading heading="Lines">
      <template #actions>
        <Button as-child>
          <RouterLink to="/studies/new">Create new line</RouterLink>
        </Button>
      </template>
    </BaseSectionHeading>
    <Suspense>
      <LineList class="mt-4 grow" />
      <template #fallback>TODO LOADIN...</template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import LineList from "@components/lines/LineList.vue";
import { Button } from "@/components/ui/button";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});
</script>
