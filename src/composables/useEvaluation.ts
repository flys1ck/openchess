import { beginEvaluation, stopEvaluation } from "@services/evaluation";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { Chess } from "chess.js";
import { Key } from "chessground/types";
import { Ref, computed, ref, watchEffect } from "vue";

interface BestMoveResponse {
  depth: number;
  evaluation: number;
  nodesPerSecond: number;
  source: Key;
  destination: Key;
  // list of UCi moves
  principleVariation: string[];
}

export function useEvaluation(
  fen: Ref<string>,
  turnColor: Ref<"white" | "black">,
  options?: {
    onEvaluationUpdate?: (evaluation: BestMoveResponse) => void;
    onEvaluationStop?: () => void;
  }
) {
  const chess = new Chess();

  const isEvaluationEnabled = ref(false);
  const depth = ref(0);
  const score = ref(0);
  const nodesPerSecond = ref(0);
  const principleVariation = ref("");

  let unlisten: UnlistenFn;

  watchEffect(async (onCleanup) => {
    principleVariation.value = "";

    if (isEvaluationEnabled.value === false) {
      depth.value = 0;
      score.value = 0;
      nodesPerSecond.value = 0;
      principleVariation.value = "";
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

      chess.load(fen.value);
      response.principleVariation.forEach((uciMove) => chess.move(uciMove));
      // TODO: logic already used somewhere else, merge it
      // FIXME: wrong move number
      const currentPrincipleVariation = chess
        .history()
        .reduce((acc, move, i) => {
          if (i % 2 == 0) return `${acc} ${i / 2 + 1}. ${move}`;
          return `${acc} ${move}`;
        }, "")
        .trim();

      if (currentPrincipleVariation.length > principleVariation.value.length) {
        principleVariation.value = currentPrincipleVariation;
      }

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

  return { isEvaluationEnabled, depth, score, nodesPerSecond, evaluatedScore, principleVariation };
}
