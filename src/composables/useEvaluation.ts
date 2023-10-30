import { Command } from "@tauri-apps/api/shell";
import { Chess } from "chess.js";
import {
  BestMoveCommand,
  DepthInfoAttr,
  InfoCommand,
  MultiPrincipalVariationInfoAttr,
  NpsInfoAttr,
  PrincipalVariationInfoAttr,
  ReadyOkCommand,
  ScoreInfoAttr,
  SelectiveDepthInfoAttr,
  tryParseOne,
  UciMove,
} from "uci-parser-ts";
import { ref, Ref, watch } from "vue";

interface UseEvaluationOptions {
  depth?: Ref<[number]>;
  multipv?: Ref<[number]>;
}

interface MultiPvInfo {
  id: number;
  principleVariation: UciMove[];
  evaluatedScore: string;
}

export async function useEvaluation(fen: Ref<string>, options?: UseEvaluationOptions) {
  const chess = new Chess();
  chess.load(fen.value);
  let currentTurnColor = chess.turn();

  const command = Command.sidecar("bin/stockfish");
  const child = await command.spawn();

  // wether evaluation is enabled
  const isEvaluationEnabled = ref(false);
  // wether an evaluation is running. `false` when evaluation depth is reached
  const isEvaluating = ref(false);
  const currentDepth = ref(0);
  const nodesPerSecond = ref(0);
  const multiPvInfo = ref<MultiPvInfo[]>([]);

  watch([fen, isEvaluationEnabled, options?.depth, options?.multipv], async (_newValues, _oldValues, onCleanup) => {
    if (isEvaluationEnabled.value === false) {
      isEvaluating.value = false;
      currentDepth.value = 0;
      nodesPerSecond.value = 0;
      multiPvInfo.value = [];
      command.stdout.removeAllListeners();
      child.write("stop\n");
      return;
    }

    // TODO: check correct order of commands
    // TODO: get threads/hash size from system
    await child.write(`setoption name Threads value 4\n`);
    await child.write(`setoption name Hash value 2048\n`);
    await child.write(`setoption name UCI_AnalyseMode value true\n`);

    // wait for engine to be ready
    await new Promise((resolve) => {
      command.stdout.on("data", (line) => {
        const command = tryParseOne(line);
        if (command instanceof ReadyOkCommand) resolve(true);
      });
      child.write("isready\n");
    });

    chess.load(fen.value);
    currentTurnColor = chess.turn();

    command.stdout.on("data", onEngineResponse);
    if (options && options.multipv) await child.write(`setoption name multipv value ${options.multipv.value}\n`);
    await child.write(`position fen ${fen.value}\n`);
    options && options.depth ? await child.write(`go depth ${options.depth.value}\n`) : await child.write("go\n");
    isEvaluating.value = true;

    // cleanup is called, if there are running promises, when the watcher updates
    onCleanup(() => {
      command.stdout.removeAllListeners();
      child.write("stop\n");
    });
  });

  function getEvaluatedScore(centipawns: number | undefined, mate: number | undefined): string {
    if (mate !== undefined) return `#${mate}`;
    if (centipawns === undefined) return "-";
    const pawnAdvantage = centipawns / 100;
    const score = currentTurnColor === "w" ? pawnAdvantage : -pawnAdvantage;
    switch (Math.sign(score)) {
      case -1:
        return score.toFixed(2);
      case 1:
        return `+${score.toFixed(2)}`;
      default:
        return "0.00";
    }
  }

  function onEngineResponse(line: string) {
    let _depth = 0;
    let _selectiveDepth = 0;
    let _multipv: number | undefined;
    let _centipawns: number | undefined;
    let _mate: number | undefined;
    let _nodesPerSecond = 0;
    let _principleVariation: UciMove[] = [];

    const command = tryParseOne(line);
    if (!command || !isEvaluationEnabled.value) return;
    if (command instanceof InfoCommand) {
      command.attributes.forEach((attribute) => {
        if (attribute instanceof DepthInfoAttr) _depth = attribute.depth;
        if (attribute instanceof SelectiveDepthInfoAttr) _selectiveDepth = attribute.depth;
        if (attribute instanceof MultiPrincipalVariationInfoAttr) _multipv = attribute.multiPv;
        if (attribute instanceof ScoreInfoAttr) {
          _centipawns = attribute.centipawn;
          _mate = attribute.mate;
        }
        if (attribute instanceof NpsInfoAttr) _nodesPerSecond = attribute.nps;
        if (attribute instanceof PrincipalVariationInfoAttr) _principleVariation = attribute.moves;
      });
      // skip update if selective depth is not present
      if (!_selectiveDepth || !_multipv) return;

      currentDepth.value = _depth;
      nodesPerSecond.value = _nodesPerSecond;
      multiPvInfo.value[_multipv - 1] = {
        id: _multipv - 1,
        principleVariation: _principleVariation,
        evaluatedScore: getEvaluatedScore(_centipawns, _mate),
      };
    } else if (command instanceof BestMoveCommand) {
      isEvaluating.value = false;
    }
  }

  return {
    isEvaluationEnabled,
    isEvaluating,
    currentDepth,
    nodesPerSecond,
    multiPvInfo,
  };
}
