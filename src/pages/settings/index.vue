<template>
  <main class="flex-1 overflow-auto">
    <!-- Settings forms -->
    <BaseContainer>
      <div class="divide-y">
        <!-- Lichess Token -->
        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 class="text-base font-semibold leading-7">Lichess</h2>
            <p class="mt-1 text-sm leading-6 text-gray-500">
              Integrate your Lichess account with a generated
              <BaseLink as="button" @click="open('https://lichess.org/account/oauth/token')"
                >Personal API Access Token</BaseLink
              >. There are no permissions required.
            </p>
          </div>
          <form class="space-y-2 md:col-span-2" @submit.prevent>
            <BaseInputLabel html-for="token">Personal API Access Token</BaseInputLabel>
            <div class="flex items-start gap-2">
              <BaseInput
                id="token"
                name="token"
                class="flex-grow"
                label="Personal API Access Token"
                v-model.trim="token"
                :schema="lichessTokenSchema"
                :async-schema="asyncLichessTokenSchema"
              />
              <BaseButton variant="primary" type="submit">Save</BaseButton>
            </div>
            <p v-if="lichess.username" class="flex items-center gap-1 text-sm text-gray-500">
              <CheckBadgeIcon class="h-4 w-4 text-blue-500" />Token connected to {{ lichess.username }}
            </p>
          </form>
        </div>
      </div>
    </BaseContainer>
  </main>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import BaseContainer from "@components/base/BaseContainer.vue";
import { z } from "zod";
import { useLichess } from "@stores/useLichess";
import BaseLink from "@components/base/BaseLink.vue";
import { ref } from "vue";
import { CheckBadgeIcon } from "@heroicons/vue/24/solid";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import BaseInput from "@components/base/BaseInput.vue";
import { open } from "@tauri-apps/api/shell";

const lichess = useLichess();
const token = ref(lichess.personalAccessToken);
const lichessTokenSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z0-9_]+$/, "Token must contain only alphanumeric characters, - and _");
const asyncLichessTokenSchema = z.string().refine(
  async (token) => {
    return await lichess.validateAndSetPersonalAccessToken(token);
  },
  { message: "Token not valid" }
);
</script>
