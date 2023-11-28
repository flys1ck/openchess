<template>
  <BaseTooltip>
    <template #trigger>
      <time datetime="TODO" v-bind="$attrs">{{ formattedRelativeDate }}</time>
    </template>
    {{ formattedDate }}
  </BaseTooltip>
</template>

<script setup lang="ts">
import BaseTooltip from "@components/base/BaseTooltip.vue";
import { format, formatDistance } from "date-fns";
import { computed } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  date: Date;
}>();

const formattedDate = computed(() => {
  return format(props.date, "dd MMM yyyy, HH:mm");
});
const formattedRelativeDate = computed(() => {
  return formatDistance(props.date, new Date(), { addSuffix: true });
});
</script>
