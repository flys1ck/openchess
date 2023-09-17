<template>
  <BaseContainer>
    <BaseSectionHeading heading="Games on Lichess">
      <template #actions>
        <BaseButton
          variant="secondary"
          :prefix-icon="ArrowPathIcon"
          @click="lichessGameList?.refresh"
          >Refresh</BaseButton
        >
      </template>
    </BaseSectionHeading>
    <Suspense>
      <LichessGameList ref="lichessGameList" class="my-4" />
    </Suspense>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import LichessGameList from "@components/games/LichessGameList.vue";
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
    name: "Lichess",
    to: "/games/lichess/",
  },
]);

const lichessGameList = ref<InstanceType<typeof LichessGameList>>();
</script>
