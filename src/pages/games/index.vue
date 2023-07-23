<template>
  <div
    class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow md:grid md:grid-cols-2 md:gap-px md:divide-y-0 m-4"
  >
    <div
      v-for="(platform, i) in platforms"
      :key="platform.title"
      :class="[
        i === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
        i === 1 ? 'sm:rounded-tr-lg' : '',
        i === platforms.length - 2 ? 'sm:rounded-bl-lg' : '',
        i === platforms.length - 1 ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none' : '',
        'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 flex items-center gap-8',
      ]"
    >
      <div>
        <span
          :class="[platform.iconBackground, platform.iconForeground, 'inline-flex rounded-lg p-3 ring-4 ring-white']"
        >
          <component :is="platform.icon" class="h-6 w-6" />
        </span>
      </div>
      <div>
        <h3 class="text-base font-semibold leading-6 text-gray-900">
          <RouterLink :to="platform.to" class="focus:outline-none">
            <!-- Extend touch target to entire panel -->
            <span class="absolute inset-0" aria-hidden="true" />
            {{ platform.title }}
          </RouterLink>
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at blanditiis et quo
          et molestiae.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseLink from "@components/base/BaseLink.vue";
import { AcademicCapIcon } from "@heroicons/vue/24/solid";
import { BanknotesIcon, CheckBadgeIcon, ClockIcon, ReceiptRefundIcon, UsersIcon } from "@heroicons/vue/24/outline";
import { useBreadcrumbs } from "@stores/useBreadcrumbs";
import { definePage } from "vue-router/auto";

definePage({
  meta: {
    layout: "breadcrumbs",
  },
});

const { setBreadcrumbs } = useBreadcrumbs();
setBreadcrumbs([
  {
    icon: AcademicCapIcon,
    name: "Games",
    to: "/games/",
  },
]);

const platforms = [
  {
    title: "Lichess",
    to: "/games/lichess",
    icon: ClockIcon,
    iconForeground: "text-teal-700",
    iconBackground: "bg-teal-50",
  },
  {
    title: "Over the board (Coming soon!)",
    to: "#",
    icon: CheckBadgeIcon,
    iconForeground: "text-purple-700",
    iconBackground: "bg-purple-50",
  },
];
</script>
