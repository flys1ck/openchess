<template>
  <BaseContainer>
    <BaseSectionHeading heading="Games on Lichess">
      <template #actions>
        <Button variant="outline" @click="lichessGameList?.refresh"
          ><RefreshCw data-icon="inline-start" />Refresh</Button
        >
      </template>
    </BaseSectionHeading>
    <LichessGameList ref="lichessGameList" class="my-4" />
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import LichessGameList from "@components/games/LichessGameList.vue";
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
    name: "Lichess",
    to: "/games/lichess/",
  },
]);

const lichessGameList = ref<InstanceType<typeof LichessGameList>>();
</script>
