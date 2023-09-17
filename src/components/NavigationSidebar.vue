<template>
  <div class="flex flex-shrink-0 flex-col bg-gray-800 py-5">
    <!-- Navigation -->
    <div class="mt-5 flex flex-grow flex-col justify-between">
      <nav class="flex flex-1 flex-col gap-1">
        <RouterLink
          v-for="{ icon, text, to } in navigationItems"
          :to="to"
          :key="to"
          v-slot="{ isActive }"
        >
          <div
            class="transition-color ml-1.5 flex flex-col items-center gap-2 overflow-hidden rounded-l-lg p-1.5 font-medium text-gray-50 hover:bg-gray-700"
            :class="{ 'bg-gray-700': isActive }"
          >
            <Component
              :is="icon"
              class="h-6 w-6"
              :class="{ 'text-orange-400': isActive }"
            />
            <span class="text-xs lowercase">{{ text }}</span>
          </div>
        </RouterLink>
      </nav>
      <button v-if="session" @click="onSignOut">
        <BaseAvatar
          :src="session.user.user_metadata.picture ?? profileUrl"
          alt="Profile picture of your user account"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigationItems } from "@data/navigationItems";
import { useSession } from "@stores/useSession";
import { useRouter } from "vue-router/auto";
import profileUrl from "../assets/images/profile_default.png";
import BaseAvatar from "./base/BaseAvatar.vue";
import { useLichess } from "@stores/useLichess";

const router = useRouter();
const lichess = useLichess();
const { session, signOut } = useSession();

function onSignOut() {
  signOut();
  lichess.clearToken();
  router.push("/signin");
}
</script>
