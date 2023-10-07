<template>
  <div v-if="studies" class="flex">
    <StudiesEmptyState v-if="!studies.length" />
    <ul v-else role="list" class="flex-grow space-y-4">
      <BaseCard v-for="study in studies" :key="study.id" as="li" class="flex justify-between gap-x-6 p-6">
        <div>
          <div class="flex items-start gap-x-3">
            <p class="text-sm font-semibold leading-6 text-gray-900">{{ study.name }}</p>
          </div>
          <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
            <p class="whitespace-nowrap">Created <BaseTime :date="new Date(study.created_at)" /></p>
            &bull;
            <!-- <p class="truncate">Created by {{ study.createdBy }}</p> -->
          </div>
        </div>
        <div class="flex items-center gap-x-4">
          <BaseButton as="RouterLink" :to="`/studies/${study.id}`" variant="secondary"
            >View study<span class="sr-only">, {{ study.name }}</span>
          </BaseButton>
          <Menu as="div" class="relative">
            <MenuButton class="block p-2.5 text-gray-500 hover:text-gray-900">
              <span class="sr-only">Open options</span>
              <EllipsisVerticalIcon class="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
              >
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                    >Edit<span class="sr-only">, {{ study.name }}</span></a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a href="#" :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                    >Move<span class="sr-only">, {{ study.name }}</span></a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="deleteStudy(study.id)"
                    :class="[active ? 'bg-gray-50' : '', 'block px-3 py-1 text-sm leading-6 text-gray-900']"
                  >
                    Delete<span class="sr-only">, {{ study.name }}</span>
                  </button>
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </BaseCard>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { EllipsisVerticalIcon } from "@heroicons/vue/20/solid";
import BaseButton from "../base/BaseButton.vue";
import StudiesEmptyState from "./StudiesEmptyState.vue";
import BaseCard from "@components/base/BaseCard.vue";
import BaseTime from "@components/base/BaseTime.vue";
import { deleteStudy, getStudies } from "@services/db";

// TODO move this to services
const studies = await getStudies();
</script>
