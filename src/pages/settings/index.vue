<template>
  <BaseContainer class="space-y-8">
    <BaseSectionHeading heading="Settings" />
    <!-- Lichess Token -->
    <BaseSettingsSection heading="Lichess Token">
      <template #description>
        Integrate your Lichess account with a generated
        <BaseLink as="button" @click="open('https://lichess.org/account/oauth/token')"
          >Personal API Access Token</BaseLink
        >. There are no extra permissions required.
      </template>
      <template #form>
        <form class="space-y-1" @submit.prevent>
          <BaseInputLabel html-for="token">Personal API Access Token</BaseInputLabel>
          <div class="flex items-start gap-2">
            <BaseInput
              id="token"
              name="token"
              class="flex-grow"
              label="Personal API Access Token"
              v-model.trim="lichessToken"
              :schema="lichessTokenSchema"
              :async-schema="lichessTokenAsyncSchema"
            />
            <BaseButton variant="primary" type="submit">Save</BaseButton>
          </div>
          <p v-if="lichess.username" class="flex items-center gap-1 text-sm text-gray-500">
            <CheckBadgeIcon class="h-4 w-4 text-blue-500" />Token connected to {{ lichess.username }}
          </p>
        </form>
      </template>
    </BaseSettingsSection>
    <BaseSettingsSection heading="Chess.com Username">
      <template #description> Integrate your Chess.com account with your username. </template>
      <template #form>
        <form class="space-y-1" @submit.prevent>
          <BaseInputLabel html-for="chessdotcom-username">Chess.com Username</BaseInputLabel>
          <div class="flex items-start gap-2">
            <BaseInput
              id="chessdotcom-username"
              name="chessdotcom-username"
              class="flex-grow"
              v-model.trim="chessdotcomUsername"
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
import BaseLink from "@components/base/BaseLink.vue";
import BaseSectionHeading from "@components/base/BaseSectionHeading.vue";
import BaseSettingsSection from "@components/base/BaseSettingsSection.vue";
import { CheckBadgeIcon, Cog8ToothIcon } from "@heroicons/vue/24/solid";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { useChessDotCom } from "@stores/useChessDotCom";
import { useLichess } from "@stores/useLichess";
import { open } from "@tauri-apps/api/shell";
import { ref } from "vue";
import { definePage } from "vue-router/auto";
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
const lichessToken = ref(lichess.personalAccessToken);
const lichessTokenSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9_]+$/, "Token must contain only alphanumeric characters, - and _.");
const lichessTokenAsyncSchema = z.string().refine(
  async (token) => {
    return await lichess.validateAndSetPersonalAccessToken(token);
  },
  { message: "Token not valid." }
);

const chessdotcom = useChessDotCom();
const chessdotcomUsername = ref(chessdotcom.username);
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
</script>
