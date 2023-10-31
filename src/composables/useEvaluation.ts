import { Command } from "@tauri-apps/api/shell";
import { parseFen } from "chessops/fen";
import {
  BestMoveCommand,
  DepthInfoAttr,
  IdCommand,
  InfoCommand,
  MultiPrincipalVariationInfoAttr,
  NpsInfoAttr,
  PrincipalVariationInfoAttr,
  ReadyOkCommand,
  ScoreInfoAttr,
  SelectiveDepthInfoAttr,
  UciMove,
  tryParseOne,
} from "uci-parser-ts";
import { Ref, computed, ref, watch } from "vue";

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
  // wether evaluation is enabled
  const isEvaluationEnabled = ref(false);
  // wether an evaluation is running. `false` when evaluation depth is reached
  const isEvaluating = ref(false);
  const currentDepth = ref(0);
  const nodesPerSecond = ref(0);
  const multiPvInfo = ref<MultiPvInfo[]>([]);

  const currentTurnColor = computed(() => parseFen(fen.value).unwrap().turn);

  // engine process
  const sidecar = Command.sidecar("bin/stockfish");
  const child = await sidecar.spawn();
  const engineName = await new Promise((resolve) => {
    const resolveOnEngineName = (line: string) => {
      const command = tryParseOne(line);
      if (!(command instanceof IdCommand && command.kind === "name")) return;

      sidecar.stdout.removeListener("data", resolveOnEngineName);
      resolve(command.value);
    };

    sidecar.stdout.on("data", resolveOnEngineName);
    child.write("uci\n");
  });

  // TODO: get threads/hash size from system
  await Promise.all([
    sidecar.stderr.on("data", (line) => console.error(line)),
    sidecar.stdout.on("data", onEngineResponse),
    child.write(`setoption name Threads value 4\n`),
    child.write(`setoption name Hash value 2048\n`),
    child.write(`setoption name UCI_AnalyseMode value true\n`),
    child.write(`setoption name UCI_Variant value chess\n`),
  ]);

  watch(
    [fen, isEvaluationEnabled, options?.depth, options?.multipv],
    async ([_newFen, _newIsEvaluationEnabled, _newDepth, _newMultiPv], _oldValues, onCleanup) => {
      if (isEvaluationEnabled.value === false) {
        isEvaluating.value = false;
        currentDepth.value = 0;
        nodesPerSecond.value = 0;
        multiPvInfo.value = [];
        child.write("stop\n");
        return;
      }

      const multiPvOption = (options && options.multipv && options.multipv.value[0]) ?? 1;
      await Promise.all([
        child.write(`setoption name multipv value ${multiPvOption}\n`),
        child.write(`position fen ${fen.value}\n`),
      ]);

      // wait for engine to be ready
      await new Promise((resolve) => {
        const resolveOnReadyOk = (line: string) => {
          const command = tryParseOne(line);
          if (!(command instanceof ReadyOkCommand)) return;

          sidecar.stdout.removeListener("data", resolveOnReadyOk);
          resolve(true);
        };

        sidecar.stdout.on("data", resolveOnReadyOk);
        child.write("isready\n");
      });

      await child.write(`position fen ${fen.value}\n`);
      options && options.depth ? await child.write(`go depth ${options.depth.value}\n`) : await child.write("go\n");
      isEvaluating.value = true;

      // cleanup is called, if there are running promises, when the watcher updates
      onCleanup(async () => {
        isEvaluating.value = false;
        await child.write("stop\n");
      });
    }
  );

  function getEvaluatedScore(centipawns: number | undefined, mate: number | undefined): string {
    if (mate !== undefined) return `#${mate}`;
    if (centipawns === undefined) return "-";
    const pawnAdvantage = centipawns / 100;
    const score = currentTurnColor.value === "white" ? pawnAdvantage : -pawnAdvantage;
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
    // prevent updating commands whe evaluation is turned off
    if (!isEvaluationEnabled.value) return;

    let _depth = 0;
    let _selectiveDepth = 0;
    let _multipv: number | undefined;
    let _centipawns: number | undefined;
    let _mate: number | undefined;
    let _nodesPerSecond = 0;
    let _principleVariation: UciMove[] = [];

    const command = tryParseOne(line);
    if (!command) return;
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
      // skip update if
      // * selective depth is not present
      // * multipv is not present
      // * multipv is greater than current multipv option
      const multiPvOption = (options && options.multipv && options.multipv.value[0]) ?? 1;
      if (!_selectiveDepth || !_multipv || _multipv > multiPvOption) return;

      currentDepth.value = _depth;
      nodesPerSecond.value = _nodesPerSecond;

      multiPvInfo.value[_multipv - 1] = {
        id: _multipv - 1,
        principleVariation: _principleVariation,
        evaluatedScore: getEvaluatedScore(_centipawns, _mate),
      };
      multiPvInfo.value = multiPvInfo.value.filter((info) => info.id < multiPvOption);
    } else if (command instanceof BestMoveCommand) {
      isEvaluating.value = false;
    }
  }

  async function killProcess() {
    isEvaluationEnabled.value = false;
    await child.kill();
    sidecar.stdout.removeAllListeners();
    sidecar.stderr.removeAllListeners();
  }

  return {
    engineName,
    isEvaluationEnabled,
    isEvaluating,
    currentDepth,
    nodesPerSecond,
    multiPvInfo,
    killProcess,
  };
}
