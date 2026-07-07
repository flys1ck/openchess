<template>
  <BaseContainer class="space-y-8">
    <BaseSectionHeading heading="Settings" />
    <!-- Lichess Account -->
    <BaseSettingsSection heading="Lichess Account">
      <template #description> Connect your Lichess account to access your games and profile. </template>
      <template #form>
        <div v-if="lichess.isConnected" class="flex items-center gap-4">
          <BaseButton variant="danger-outline" :disabled="isDisconnecting" @click="handleDisconnect">
            Disconnect
          </BaseButton>
          <p class="flex items-center gap-1 text-sm text-gray-500">
            <CheckBadgeIcon class="h-4 w-4 text-blue-500" />
            Connected as {{ lichess.username }}
          </p>
        </div>
        <BaseButton v-else :disabled="isConnecting" @click="handleConnect">
          {{ isConnecting ? "Connecting..." : "Connect with Lichess" }}
        </BaseButton>
      </template>
    </BaseSettingsSection>
    <!-- Chess.com Username -->
    <BaseSettingsSection heading="Chess.com Username">
      <template #description> Integrate your Chess.com account with your username. </template>
      <template #form>
        <form class="space-y-1" @submit.prevent>
          <BaseInputLabel html-for="chessdotcom-username">Chess.com Username</BaseInputLabel>
          <div class="flex items-start gap-2">
            <BaseInput
              id="chessdotcom-username"
              name="chessdotcom-username"
              class="grow"
              v-model.trim="chessdotcomUsernameInputRef"
              :schema="chessdotcomUsernameSchema"
              :async-schema="chessdotcomUsernameAsyncSchema"
            />
            <BaseButton variant="primary" type="submit">Save</BaseButton>
          </div>
          <p v-if="chessdotcom.username" class="flex items-center gap-1 text-sm text-gray-500">
            <CheckBadgeIcon class="h-4 w-4 text-blue-500" />Connected to {{ chessdotcom.username }}
          </p>
        </form>
      </template>
    </BaseSettingsSection>
  </BaseContainer>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import BaseInput from "@components/base/BaseInput.vue";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import { CheckBadgeIcon, Cog8ToothIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { ref } from "vue";
import { z } from "zod";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: Cog8ToothIcon,
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
const chessdotcomUsernameAsyncSchema = z.string().refine(
  async (username) => {
    return await chessdotcom.validateAndSetUsername(username);
  },
  { message: "Username not valid." }
);
const chessdotcomUsernameInputRef = ref(chessdotcom.username);
</script>
