<template>
  <BaseContainer>
    <BaseSectionHeading heading="Games on Chess.com">
      <template #actions>
        <Button variant="outline" @click="chessDotComGameList?.refresh"
          ><RefreshCw data-icon="inline-start" />Refresh</Button
        >
      </template>
    </BaseSectionHeading>
    <Suspense>
      <ChessDotComGameList ref="chessDotComGameList" class="my-4" />
      <template #fallback>
        <div class="space-y-4">
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
          <StudyCardSkeleton />
        </div>
      </template>
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChessDotComGameList from "@components/games/ChessDotComGameList.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import { GraduationCap, RefreshCw } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref } from "vue";
import { Button } from "@/components/ui/button";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: GraduationCap,
    name: "Games",
    to: "/games/",
  },
  {
    name: "Chess.com",
    to: "/games/chessdotcom/",
  },
]);

const chessDotComGameList = ref<InstanceType<typeof ChessDotComGameList>>();
</script>
