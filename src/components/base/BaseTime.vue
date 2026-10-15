<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <time :datetime="isoString" v-bind="$attrs">{{ formattedRelativeDate }}</time>
    </TooltipTrigger>
    <TooltipContent>{{ formattedDate }}</TooltipContent>
  </Tooltip>
</template>

<script setup lang="ts">
import { format, formatDistance } from "date-fns";
import { computed } from "vue";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ date: Date }>();
const isoString = computed(() => {
  return props.date.toISOString();
});
const formattedDate = computed(() => {
  return format(props.date, "dd MMM yyyy, HH:mm");
});
const formattedRelativeDate = computed(() => {
  return formatDistance(props.date, new Date(), { addSuffix: true });
});
</script>
