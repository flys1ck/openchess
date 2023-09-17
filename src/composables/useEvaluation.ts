import { Command } from "@tauri-apps/api/shell";
import { Chess } from "chess.js";
import {
  DepthInfoAttr,
  InfoCommand,
  NpsInfoAttr,
  PrincipalVariationInfoAttr,
  ReadyOkCommand,
  ScoreInfoAttr,
  SelectiveDepthInfoAttr,
  tryParseOne,
  UciMove,
} from "uci-parser-ts";
import { computed, Ref, ref, watch } from "vue";

export async function useEvaluation(fen: Ref<string>) {
  const chess = new Chess();
  chess.load(fen.value);
  const turnColor = chess.turn();
  const command = Command.sidecar("bin/stockfish");
  const child = await command.spawn();

  const isEvaluationEnabled = ref(false);
  const depth = ref(0);
  const centipawns = ref<number>();
  const mate = ref<number>();
  const nodesPerSecond = ref(0);
  const principleVariation = ref("");

  watch(
    [fen, isEvaluationEnabled],
    async ([newFen, newIsEvaluationEnabled], _oldValues, onCleanup) => {
      if (newIsEvaluationEnabled === false) {
        depth.value = 0;
        centipawns.value = 0;
        nodesPerSecond.value = 0;
        principleVariation.value = "";
        command.stdout.removeAllListeners();
        child.write("stop\n");
        return;
      }

      // wait for engine to be ready
      await new Promise((resolve) => {
        command.stdout.on("data", (line) => {
          const command = tryParseOne(line);
          if (command instanceof ReadyOkCommand) resolve(true);
        });
        child.write("isready\n");
      });

      command.stdout.on("data", onEngineResponse);
      await child.write(`position fen ${newFen}\n`);
      await child.write("go depth 30\n");

      // cleanup is called, if there are running promises, when the watcher updates
      onCleanup(() => {
        command.stdout.removeAllListeners();
        child.write("stop\n");
      });
    },
  );

  const evaluatedScore = computed(() => {
    if (mate.value !== undefined) return `#${mate.value}`;
    if (centipawns.value === undefined) return "-";
    const pawnAdvantage = centipawns.value / 100;
    const score = turnColor === "w" ? pawnAdvantage : -pawnAdvantage;
    switch (Math.sign(score)) {
      case -1:
        return score;
      case 1:
        return `+${score}`;
      default:
        return 0;
    }
  });

  function onEngineResponse(line: string) {
    let _depth = 0;
    let _selectiveDepth = 0;
    let _centipawns: number | undefined;
    let _mate: number | undefined;
    let _nodesPerSecond = 0;
    let _principleVariation: UciMove[] = [];

    const command = tryParseOne(line);
    if (!command || !isEvaluationEnabled.value) return;
    if (command instanceof InfoCommand) {
      command.attributes.forEach((attribute) => {
        if (attribute instanceof DepthInfoAttr) _depth = attribute.depth;
        if (attribute instanceof SelectiveDepthInfoAttr)
          _selectiveDepth = attribute.depth;
        if (attribute instanceof ScoreInfoAttr) {
          _centipawns = attribute.centipawn;
          _mate = attribute.mate;
        }
        if (attribute instanceof NpsInfoAttr) _nodesPerSecond = attribute.nps;
        if (attribute instanceof PrincipalVariationInfoAttr)
          _principleVariation = attribute.moves;
      });
      // skip update if selective depth is not present
      if (!_selectiveDepth) return;

      // generate moves string with SAN
      chess.load(fen.value);
      const initialMoveNumber = chess.moveNumber();
      const turnColor = chess.turn();
      const movesString = _principleVariation.reduce((acc, uciMove) => {
        const move = chess.move(uciMove);
        const moveDescriptor =
          move.color === "w"
            ? `${chess.moveNumber()}. ${move.san}`
            : `${move.san}`;
        return `${acc} ${moveDescriptor}`;
      }, "");

      depth.value = _depth;
      centipawns.value = _centipawns;
      mate.value = _mate;
      nodesPerSecond.value = _nodesPerSecond;
      principleVariation.value =
        turnColor === "w"
          ? movesString
          : `${initialMoveNumber} ... ${movesString}`;
    }
  }

  return {
    isEvaluationEnabled,
    depth,
    nodesPerSecond,
    evaluatedScore,
    principleVariation,
  };
}
