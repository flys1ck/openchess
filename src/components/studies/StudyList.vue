<template>
  <div v-if="studies" class="flex">
    <StudiesEmptyState v-if="!studies.length" />
    <ul v-else role="list" class="flex-grow space-y-4">
      <BaseCard v-for="study in studies" :key="study.id" as="li" class="relative flex justify-between gap-x-6 p-6">
        <div>
          <div class="flex items-start gap-x-3">
            <RouterLink :to="`/studies/${study.id}`" class="text-sm font-semibold leading-6 text-gray-900">
              <span class="absolute inset-0" />
              {{ study.name }}
            </RouterLink>
          </div>
          <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
            <p class="whitespace-nowrap">
              Created
              <BaseTime :date="new Date(study.created_at)" />
            </p>
          </div>
        </div>
      </BaseCard>
    </ul>
  </div>
</template>

<script setup lang="ts">
import BaseCard from "@components/base/BaseCard.vue";
import BaseTime from "@components/base/BaseTime.vue";
import { db, select } from "@services/database";
import { ref } from "vue";
import StudiesEmptyState from "./StudiesEmptyState.vue";

const query = db.selectFrom("studies").selectAll().compile();
const studies = ref(await select(query));
</script>
