<template>
  <aside class="flex w-96 shrink-0 flex-col gap-4 border-l p-4 2xl:w-120">
    <div>
      <div class="flex items-center gap-2">
        <h2 class="font-medium">{{ lineName }}</h2>
        <Badge variant="secondary">{{ orientationLabel }}</Badge>
      </div>
      <p class="text-muted-foreground mt-1 text-sm">{{ statusText }}</p>
    </div>
    <div>
      <div class="mb-1 flex justify-between text-sm">
        <span>Progress</span>
        <span>{{ studentMovesMade }} / {{ studentMovesTotal }}</span>
      </div>
      <Progress class="h-2" :model-value="progressPercent" />
    </div>
    <div v-if="comment" class="text-muted-foreground text-sm" v-html="comment" />
    <div class="mt-auto flex flex-col gap-2">
      <Button variant="outline" :disabled="!canHint" @click="trainer.hint">Hint</Button>
      <Button variant="outline" @click="trainer.restart">Restart</Button>
      <Button as-child>
        <RouterLink :to="analyzeTo">Analyze</RouterLink>
      </Button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useStudyTrainer } from "@composables/useStudyTrainer";
import { computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const props = defineProps<{
  trainer: ReturnType<typeof useStudyTrainer>;
  lineName: string;
  analyzeTo: string;
}>();

const orientationLabel = computed(() => (props.trainer.studentColor.value === "black" ? "Black" : "White"));
const progressPercent = computed(() => props.trainer.progressPercent.value);
const studentMovesMade = computed(() => props.trainer.studentMovesMade.value);
const studentMovesTotal = computed(() => props.trainer.studentMovesTotal.value);
const comment = computed(() => props.trainer.comment.value);
const canHint = computed(() => props.trainer.canHint.value);

const statusText = computed(() => {
  const feedback = props.trainer.feedback.value;
  if (feedback === "complete") return "Line complete";
  if (feedback === "retry") return "Try again";
  return "Your move";
});
</script>
