<template>
  <BaseContainer>
    <Tabs v-model="source" class="gap-0">
      <BaseSectionHeading heading="Games">
        <template #actions>
          <div class="flex items-center gap-2">
            <TabsList>
              <TabsTrigger v-for="option in GAME_SOURCES" :key="option.value" :value="option.value" class="px-3">
                {{ option.name }}
              </TabsTrigger>
            </TabsList>
            <Button v-if="isSourceConnected" variant="outline" @click="refresh">
              <RefreshCw data-icon="inline-start" />Refresh
            </Button>
          </div>
        </template>
      </BaseSectionHeading>
      <TabsContent v-for="option in GAME_SOURCES" :key="option.value" :value="option.value">
        <template v-if="isSourceConnected">
          <LichessGameList v-if="option.value === 'lichess'" ref="lichessGameList" class="my-4" />
          <ChessDotComGameList v-else ref="chessDotComGameList" class="my-4" />
        </template>
        <Empty v-else>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Unplug />
            </EmptyMedia>
            <EmptyTitle>{{ option.name }} isn't connected</EmptyTitle>
            <EmptyDescription>{{ option.connectHint }}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button as-child>
              <RouterLink :to="navigationItems.settings.to">Open settings</RouterLink>
            </Button>
          </EmptyContent>
        </Empty>
      </TabsContent>
    </Tabs>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import ChessDotComGameList from "@components/games/ChessDotComGameList.vue";
import LichessGameList from "@components/games/LichessGameList.vue";
import { navigationItems } from "@data/navigationItems";
import { RefreshCw, Unplug } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([navigationItems.games]);

type GameSource = "lichess" | "chessdotcom";

const GAME_SOURCES: { value: GameSource; name: string; connectHint: string }[] = [
  { value: "lichess", name: "Lichess", connectHint: "Connect your Lichess account to see your games." },
  { value: "chessdotcom", name: "Chess.com", connectHint: "Add your Chess.com username to see your games." },
];

const route = useRoute("/games/");
const router = useRouter();
const lichess = useLichess();
const chessDotCom = useChessDotCom();

const source = computed<GameSource>({
  get() {
    const { source } = route.query;
    if (source === "lichess" || source === "chessdotcom") return source;
    return !lichess.isConnected && chessDotCom.username ? "chessdotcom" : "lichess";
  },
  set(value) {
    void router.replace({ query: { ...route.query, source: value } });
  },
});

const isSourceConnected = computed(() =>
  source.value === "lichess" ? lichess.isConnected : Boolean(chessDotCom.username)
);

// Both lists sit in a v-for, so their refs are arrays with at most the one mounted list.
const lichessGameList = ref<InstanceType<typeof LichessGameList>[]>([]);
const chessDotComGameList = ref<InstanceType<typeof ChessDotComGameList>[]>([]);

function refresh() {
  const list = source.value === "lichess" ? lichessGameList.value[0] : chessDotComGameList.value[0];
  list?.refresh();
}
</script>
