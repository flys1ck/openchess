import { Command } from "@tauri-apps/api/shell";
import { Chess } from "chess.js";
import { Key } from "chessground/types";
import {
  DepthInfoAttr,
  InfoCommand,
  NpsInfoAttr,
  PrincipalVariationInfoAttr,
  ScoreInfoAttr,
  tryParseOne,
  UciMove,
} from "uci-parser-ts";
import { computed, ref, watchEffect } from "vue";

export async function useEvaluation(fen: string, turnColor: "white" | "black") {
  const chess = new Chess();
  const command = Command.sidecar("bin/stockfish");
  command.stdout.on("data", (line) => {
    console.log({ line });

    const command = tryParseOne(line);
    console.log(command);

    if (!command) return;
    if (command instanceof InfoCommand) {
      command.attributes.forEach((attribute) => {
        if (attribute instanceof DepthInfoAttr) depth.value = attribute.depth;
        if (attribute instanceof ScoreInfoAttr) centipawns.value = attribute.centipawn;
        if (attribute instanceof NpsInfoAttr) nodesPerSecond.value = attribute.nps;
        if (attribute instanceof PrincipalVariationInfoAttr) principleVariation.value = attribute.moves;
      });
    }
  });
  const child = await command.spawn();

  const isEvaluationEnabled = ref(false);
  const depth = ref(0);
  const centipawns = ref<number | undefined>(0);
  const nodesPerSecond = ref(0);
  const principleVariation = ref<UciMove[]>([]);

  watchEffect(async (onCleanup) => {
    principleVariation.value = [];

    if (isEvaluationEnabled.value === false) {
      console.log("stop");

      depth.value = 0;
      centipawns.value = 0;
      nodesPerSecond.value = 0;
      principleVariation.value = [];
      child.write("stop\n");
      // stopEvaluation();
      // if (options?.onEvaluationStop) options.onEvaluationStop();
      return;
    }
    console.log("go");

    await child.write("go\n");

    // await listen<BestMoveResponse>("bestmove", (e) => {
    //   const response = e.payload;
    //   depth.value = response.depth;
    //   score.value = response.evaluation;
    //   nodesPerSecond.value = response.nodesPerSecond;

    //   chess.load(fen.value);
    //   response.principleVariation.forEach((uciMove) => chess.move(uciMove));
    //   // TODO: logic already used somewhere else, merge it
    //   // FIXME: wrong move number
    //   const currentPrincipleVariation = chess
    //     .history()
    //     .reduce((acc, move, i) => {
    //       if (i % 2 == 0) return `${acc} ${i / 2 + 1}. ${move}`;
    //       return `${acc} ${move}`;
    //     }, "")
    //     .trim();

    //   if (currentPrincipleVariation.length > principleVariation.value.length) {
    //     principleVariation.value = currentPrincipleVariation;
    //   }

    //   if (options?.onEvaluationUpdate) options.onEvaluationUpdate(response);
    // });
  });

  const evaluatedScore = computed(() => {
    if (centipawns.value === undefined) return "-";
    const pawnAdvantage = centipawns.value / 100;
    const s = turnColor === "white" ? pawnAdvantage : -pawnAdvantage;
    switch (Math.sign(s)) {
      case -1:
        return s;
      case 1:
        return `+${s}`;
      default:
        return 0;
    }
  });

  return { isEvaluationEnabled, depth, score: centipawns, nodesPerSecond, evaluatedScore, principleVariation };
}
