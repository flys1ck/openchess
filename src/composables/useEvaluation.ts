import { Key } from "chessground/types";
import { Ref, ref } from "vue";

interface BestMoveResponse {
  depth: number;
  evaluation: number;
  nodes_per_second: number;
  source: Key;
  destination: Key;
}

export function useEvaluation(
  fen: Ref<string>,
  onEvaluationUpdate?: (evaluation: BestMoveResponse) => void,
  onEvaluationStop?: () => void
) {
  const isEvaluationEnabled = ref(false);
  const depth = ref(0);
  const score = ref(0);
  const nodesPerSecond = ref(0);

  // let unlisten: UnlistenFn;

  // watchEffect(async () => {
  //   if (isEvaluationEnabled.value === false) {
  //     stopEvaluation();
  //     unlisten();
  //     onEvaluationStop();
  //     return;
  //   }
  //   beginEvaluation(fen.value);
  //   unlisten = await listen<BestMoveResponse>("bestmove", (e) => {
  //     const response = e.payload;
  //     depth.value = response.depth;
  //     score.value = response.evaluation;
  //     nodesPerSecond.value = response.nodes_per_second;
  //     onEvaluationUpdate(response);
  //   });
  // });

  // const evaluatedScore = computed(() => {
  //   const pawnAdvantage = score.value / 100;
  //   const s = game.turnColor === "white" ? pawnAdvantage : -pawnAdvantage;
  //   switch (Math.sign(s)) {
  //     case -1:
  //       return s;
  //     case 1:
  //       return `+${s}`;
  //     default:
  //       return 0;
  //   }
  // });

  return { isEvaluationEnabled, depth, score, nodesPerSecond };
}
