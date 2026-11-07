<template>
  <div>
    <!-- Accounts -->
    <BaseSettingsSection heading="Accounts">
      <template #description> Connect your accounts to browse and analyze your games. </template>
      <template #form>
        <div class="space-y-6">
          <AccountStatusRow name="Lichess" :username="lichess.isConnected ? lichess.username : undefined">
            <Button v-if="lichess.isConnected" variant="outline" :disabled="isDisconnecting" @click="handleDisconnect">
              Disconnect
            </Button>
            <div v-else-if="lichess.isConnecting" class="flex items-center gap-2">
              <Button variant="ghost" @click="lichess.cancelLogin()">Cancel</Button>
              <Button disabled><Spinner data-icon="inline-start" />Connecting...</Button>
            </div>
            <Button v-else @click="handleConnect">Connect</Button>
          </AccountStatusRow>
          <AccountStatusRow v-if="chessdotcom.username" name="Chess.com" :username="chessdotcom.username">
            <Button variant="outline" @click="chessdotcom.username = ''">Disconnect</Button>
          </AccountStatusRow>
          <form v-else @submit.prevent="connectChessdotcom">
            <Field :data-invalid="chessdotcomUsernameErrors.length > 0 || undefined">
              <FieldLabel for="chessdotcom-username">Chess.com username</FieldLabel>
              <div class="flex items-start gap-2">
                <Input
                  id="chessdotcom-username"
                  name="chessdotcom-username"
                  class="grow"
                  spellcheck="false"
                  :aria-invalid="chessdotcomUsernameErrors.length > 0 || undefined"
                  v-model.trim="chessdotcomUsernameInput"
                />
                <Button type="submit" :disabled="isValidatingChessdotcomUsername">
                  <Spinner v-if="isValidatingChessdotcomUsername" data-icon="inline-start" />
                  Connect
                </Button>
              </div>
              <FieldError :errors="chessdotcomUsernameErrors" />
              <FieldDescription>No sign-in needed. Your public games are loaded by username.</FieldDescription>
            </Field>
          </form>
        </div>
      </template>
    </BaseSettingsSection>
    <Separator class="my-8" />
    <!-- Sound -->
    <BaseSettingsSection heading="Sound">
      <template #description> Volume of move and capture sounds. </template>
      <template #form>
        <!-- Reka emits valueCommit before updating the model on keyboard input -->
        <BaseSliderField
          label="Volume"
          unit="%"
          :min="0"
          :max="100"
          :step="5"
          v-model="settings.soundVolume"
          @value-commit="nextTick(() => playAudio('move'))"
        />
      </template>
    </BaseSettingsSection>
    <Separator class="my-8" />
    <!-- Study Storage -->
    <BaseSettingsSection heading="Study Storage">
      <template #description> Local database size by study content. Per-study values are estimates. </template>
      <template #form>
        <Suspense>
          <StudyStorageChart />
          <template #fallback>
            <div class="space-y-4" aria-label="Loading study storage">
              <Skeleton class="h-5" />
              <div v-for="index in 3" :key="index" class="space-y-2">
                <Skeleton class="h-4 w-1/3" />
                <Skeleton class="h-2 rounded-full" />
              </div>
            </div>
          </template>
        </Suspense>
      </template>
    </BaseSettingsSection>
  </div>
</template>

<script setup lang="ts">
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import BaseSliderField from "@components/base/BaseSliderField.vue";
import AccountStatusRow from "@components/settings/AccountStatusRow.vue";
import StudyStorageChart from "@components/settings/StudyStorageChart.vue";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { useSettings } from "@stores/useSettings";
import { playAudio } from "@utilities/audio";
import { nextTick, ref } from "vue";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

const settings = useSettings();
const lichess = useLichess();
const isDisconnecting = ref(false);

async function handleConnect() {
  try {
    await lichess.login();
  } catch {
    // Error is already surfaced via toast in the store
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
  .min(1, "Enter your Chess.com username.")
  .regex(/^[A-Za-z0-9_-]+$/, "Usernames can only contain letters, numbers, underscores and hyphens.");
const chessdotcomUsernameInput = ref(chessdotcom.username);
const chessdotcomUsernameErrors = ref<string[]>([]);
const isValidatingChessdotcomUsername = ref(false);

async function connectChessdotcom() {
  const result = chessdotcomUsernameSchema.safeParse(chessdotcomUsernameInput.value);
  if (!result.success) {
    // An empty value fails both rules, and only the first message is useful
    chessdotcomUsernameErrors.value = result.error.issues.slice(0, 1).map((issue) => issue.message);
    return;
  }

  isValidatingChessdotcomUsername.value = true;
  try {
    const isValid = await chessdotcom.validateAndSetUsername(result.data);
    chessdotcomUsernameErrors.value = isValid ? [] : ["No Chess.com player has this username."];
  } catch {
    chessdotcomUsernameErrors.value = ["Could not reach Chess.com. Try again."];
  } finally {
    isValidatingChessdotcomUsername.value = false;
  }
}
</script>
