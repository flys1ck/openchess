<template>
  <BaseContainer>
    <BaseSectionHeading heading="Games on Chess.com">
      <template #actions>
        <BaseButton variant="secondary" :prefix-icon="ArrowPathIcon" @click="chessDotComGameList?.refresh"
          >Refresh</BaseButton
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
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChessDotComGameList from "@components/games/ChessDotComGameList.vue";
import StudyCardSkeleton from "@components/studies/StudyCardSkeleton.vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { ref } from "vue";
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
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
