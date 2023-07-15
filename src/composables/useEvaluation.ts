import { beginEvaluation, stopEvaluation } from "@services/evaluation";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { Key } from "chessground/types";
import { Ref, computed, ref, watchEffect } from "vue";

interface BestMoveResponse {
  depth: number;
  evaluation: number;
  nodesPerSecond: number;
  source: Key;
  destination: Key;
}

export function useEvaluation(
  fen: Ref<string>,
  turnColor: Ref<"white" | "black">,
  options?: {
    onEvaluationUpdate?: (evaluation: BestMoveResponse) => void;
    onEvaluationStop?: () => void;
  }
) {
  const isEvaluationEnabled = ref(false);
  const depth = ref(0);
  const score = ref(0);
  const nodesPerSecond = ref(0);

  let unlisten: UnlistenFn;

  watchEffect(async (onCleanup) => {
    if (isEvaluationEnabled.value === false) {
      stopEvaluation();
      if (unlisten) unlisten();
      if (options?.onEvaluationStop) options.onEvaluationStop();
      return;
    }
    beginEvaluation(fen.value);
    unlisten = await listen<BestMoveResponse>("bestmove", (e) => {
      const response = e.payload;
      depth.value = response.depth;
      score.value = response.evaluation;
      nodesPerSecond.value = response.nodesPerSecond;

      if (options?.onEvaluationUpdate) options.onEvaluationUpdate(response);
    });
    onCleanup(unlisten);
  });

  const evaluatedScore = computed(() => {
    const pawnAdvantage = score.value / 100;
    const s = turnColor.value === "white" ? pawnAdvantage : -pawnAdvantage;
    switch (Math.sign(s)) {
      case -1:
        return s;
      case 1:
        return `+${s}`;
      default:
        return 0;
    }
  });

  return { isEvaluationEnabled, depth, score, nodesPerSecond, evaluatedScore };
}
