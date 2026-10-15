<template>
  <Empty>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <GraduationCap />
      </EmptyMedia>
      <EmptyTitle>No studies</EmptyTitle>
      <EmptyDescription>Get started by creating a new study.</EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button as-child>
        <RouterLink to="/studies/new"><Plus data-icon="inline-start" />Create a new study</RouterLink>
      </Button>
    </EmptyContent>
  </Empty>
</template>

<script setup lang="ts">
import { GraduationCap, Plus } from "@lucide/vue";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
</script>
