<template>
  <main class="flex-1 overflow-auto">
    <header class="border-b">
      <!-- Secondary navigation -->
      <nav class="flex overflow-x-auto py-4">
        <ul role="list" class="flex min-w-full flex-none gap-x-6 px-4 text-sm leading-6 text-gray-400 sm:px-6 lg:px-8">
          <li v-for="item in secondaryNavigation" :key="item.name">
            <a :href="item.href" :class="item.current ? 'text-orange-400 font-semibold' : ''">{{ item.name }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <!-- Settings forms -->
    <div class="divide-y">
      <div class="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 class="text-base font-semibold leading-7">Delete account</h2>
          <p class="mt-1 text-sm leading-6 text-gray-500">
            No longer want to use our service? You can delete your account here. This action is not reversible. All
            information related to this account will be deleted permanently.
          </p>
        </div>
        <form class="flex items-start md:col-span-2">
          <BaseButton variant="danger" @click="onAccountDelete">Delete account</BaseButton>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import BaseButton from "@components/base/BaseButton.vue";
import { useSession } from "@stores/useSession";
import { useRouter } from "vue-router/auto";

const sessionStore = useSession();
const router = useRouter();

const secondaryNavigation = [
  { name: "Account", href: "#", current: true },
  { name: "Notifications", href: "#", current: false },
  { name: "Billing", href: "#", current: false },
  { name: "Teams", href: "#", current: false },
  { name: "Integrations", href: "#", current: false },
];

async function onAccountDelete() {
  sessionStore.signOut();
  await sessionStore.deleteAccount();
  router.push("/signin");
}
</script>
