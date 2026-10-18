<template>
  <div v-if="studies" class="flex">
    <StudiesEmptyState v-if="!studies.length" />
    <ul v-else role="list" class="grow space-y-4">
      <li v-for="study in studies" :key="study.id">
        <Card class="hover:bg-muted/50 relative flex-row justify-between gap-x-6 p-6 transition-colors">
          <div>
            <div class="flex items-start gap-x-3">
              <RouterLink :to="`/studies/${study.id}`" class="text-sm leading-6 font-semibold">
                <span class="absolute inset-0" />
                {{ study.name }}
              </RouterLink>
            </div>
            <div class="text-muted-foreground mt-1 flex items-center gap-x-2 text-xs leading-5">
              <p class="whitespace-nowrap">
                Created
                <BaseTime :date="new Date(study.created_at)" />
              </p>
            </div>
          </div>
        </Card>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import BaseTime from "@components/base/BaseTime.vue";
import { db, select } from "@services/database";
import { ref } from "vue";
import { Card } from "@/components/ui/card";
import StudiesEmptyState from "./StudiesEmptyState.vue";

const query = db.selectFrom("studies").selectAll().orderBy("id").compile();
const studies = ref(await select(query));
</script>
