<template>
  <BaseContainer class="space-y-8">
    <BaseSectionHeading heading="Settings" />
    <!-- Lichess Account -->
    <BaseSettingsSection heading="Lichess Account">
      <template #description> Connect your Lichess account to access your games and profile. </template>
      <template #form>
        <div v-if="lichess.isConnected" class="flex items-center justify-between gap-4">
          <p class="text-muted-foreground flex items-center gap-1 text-sm">
            <BadgeCheck class="size-4 text-blue-500" />
            Connected as {{ lichess.username }}
          </p>
          <Button variant="destructive" :disabled="isDisconnecting" @click="handleDisconnect">Disconnect</Button>
        </div>
        <Button v-else :disabled="isConnecting" @click="handleConnect">
          <Spinner v-if="isConnecting" data-icon="inline-start" />
          {{ isConnecting ? "Connecting..." : "Connect with Lichess" }}
        </Button>
      </template>
    </BaseSettingsSection>
    <!-- Chess.com Username -->
    <BaseSettingsSection heading="Chess.com Username">
      <template #description> Integrate your Chess.com account with your username. </template>
      <template #form>
        <form @submit.prevent="saveChessdotcomUsername">
          <Field :data-invalid="chessdotcomUsernameErrors.length > 0 || undefined">
            <FieldLabel for="chessdotcom-username">Chess.com Username</FieldLabel>
            <div class="flex items-start gap-2">
              <Input
                id="chessdotcom-username"
                name="chessdotcom-username"
                class="grow"
                spellcheck="false"
                :aria-invalid="chessdotcomUsernameErrors.length > 0 || undefined"
                v-model.trim="chessdotcomUsernameInput"
              />
              <Button variant="outline" type="submit" :disabled="isValidatingChessdotcomUsername">
                <Spinner v-if="isValidatingChessdotcomUsername" data-icon="inline-start" />
                Save
              </Button>
            </div>
            <FieldError :errors="chessdotcomUsernameErrors" />
            <FieldDescription v-if="chessdotcom.username" class="flex items-center gap-1">
              <BadgeCheck class="size-4 text-blue-500" />Connected to {{ chessdotcom.username }}
            </FieldDescription>
          </Field>
        </form>
      </template>
    </BaseSettingsSection>
    <!-- Study Storage -->
    <BaseSettingsSection heading="Study Storage">
      <template #description> Local database size by study content. Per-study values are estimates. </template>
      <template #form>
        <Suspense>
          <StudyStorageChart />
          <template #fallback>
            <div class="space-y-4" aria-label="Loading study storage">
              <div v-for="index in 3" :key="index" class="space-y-2">
                <Skeleton class="h-4 w-1/3" />
                <Skeleton class="h-1 rounded-full" />
              </div>
            </div>
          </template>
        </Suspense>
      </template>
    </BaseSettingsSection>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import StudyStorageChart from "@components/settings/StudyStorageChart.vue";
import { BadgeCheck, Settings } from "@lucide/vue";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { ref } from "vue";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: Settings,
    name: "Settings",
    to: "/settings/",
  },
]);

const lichess = useLichess();
const isConnecting = ref(false);
const isDisconnecting = ref(false);

async function handleConnect() {
  isConnecting.value = true;
  try {
    await lichess.login();
  } catch {
    // Error is already surfaced via toast in the store
  } finally {
    isConnecting.value = false;
  }
}

async function handleDisconnect() {
  isDisconnecting.value = true;
  try {
    await lichess.logout();
  } finally {
    isDisconnecting.value = false;
  }
}

const chessdotcom = useChessDotCom();
const chessdotcomUsernameSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9]+$/, "Username must contain only alphanumeric characters.");
const chessdotcomUsernameInput = ref(chessdotcom.username);
const chessdotcomUsernameErrors = ref<string[]>([]);
const isValidatingChessdotcomUsername = ref(false);

async function saveChessdotcomUsername() {
  const result = chessdotcomUsernameSchema.safeParse(chessdotcomUsernameInput.value);
  if (!result.success) {
    chessdotcomUsernameErrors.value = result.error.issues.map((issue) => issue.message);
    return;
  }

  isValidatingChessdotcomUsername.value = true;
  try {
    const isValid = await chessdotcom.validateAndSetUsername(result.data);
    chessdotcomUsernameErrors.value = isValid ? [] : ["Username not valid."];
  } finally {
    isValidatingChessdotcomUsername.value = false;
  }
}
</script>
