<template>
  <main class="flex-1 overflow-auto">
    <header class="border-b">
      <!-- Secondary navigation -->
      <nav class="flex overflow-x-auto py-4">
        <ul role="list" class="flex min-w-full flex-none gap-x-6 px-4 text-sm leading-6 text-gray-400 sm:px-6 lg:px-8">
          <li v-for="item in secondaryNavigation" :key="item.name">
            <RouterLink :to="item.to" :class="item.current ? 'text-orange-400 font-semibold' : ''">{{
              item.name
            }}</RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <!-- Settings forms -->
    <BaseContainer>
      <div class="divide-y">
        <!-- Lichess Token -->
        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 class="text-base font-semibold leading-7">Lichess</h2>
            <p class="mt-1 text-sm leading-6 text-gray-500">
              Integrate your Lichess account with a generated
              <BaseLink as="a" href="https://lichess.org/account/oauth/token">Personal API Access Token</BaseLink>.
              There are no permissions required.
            </p>
          </div>
          <form class="md:col-span-2 space-y-2" @submit.prevent>
            <BaseInputLabel html-for="token">Personal API Access Token</BaseInputLabel>
            <div class="flex gap-2 items-start">
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
            <p v-if="lichess.username" class="text-sm text-gray-500 flex gap-1 items-center">
              <CheckBadgeIcon class="w-4 h-4 text-blue-500" />Token connected to {{ lichess.username }}
            </p>
          </form>
        </div>
        <!-- Delete Account -->
        <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 class="text-base font-semibold leading-7">Delete account</h2>
            <p class="mt-1 text-sm leading-6 text-gray-500">
              No longer want to use our service? You can delete your account here. This action is not reversible. All
              information related to this account will be deleted permanently.
            </p>
          </div>
          <form class="flex items-start md:col-span-2" @submit.prevent="onAccountDelete">
            <BaseButton variant="danger" type="submit">Delete account</BaseButton>
          </form>
        </div>
      </div>
    </BaseContainer>
  </main>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import { useSession } from "@stores/useSession";
import { useRouter } from "vue-router/auto";
import { confirm } from "@tauri-apps/api/dialog";
import BaseContainer from "@components/base/BaseContainer.vue";
import { z } from "zod";
import { useLichess } from "@stores/useLichess";
import BaseLink from "@components/base/BaseLink.vue";
import { ref } from "vue";
import { CheckBadgeIcon } from "@heroicons/vue/24/solid";
import BaseInputLabel from "@components/base/BaseInputLabel.vue";
import BaseInput from "@components/base/BaseInput.vue";

const session = useSession();
const lichess = useLichess();
const router = useRouter();

const secondaryNavigation = [
  { name: "Account", to: "#", current: true },
  { name: "Integrations", to: "#", current: false },
];

async function onAccountDelete() {
  if (!(await confirm("Do you really want to permantently delete you account?"))) return;
  session.signOut();
  lichess.clearToken();
  await session.deleteAccount();
  router.push("/signin");
}

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
