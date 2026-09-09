import { Command } from "@tauri-apps/plugin-shell";
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
  type UciMove,
  tryParseOne,
} from "uci-parser-ts";
import { computed, ref, watch, type Ref } from "vue";

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
  const isEvaluationEnabled = ref(false);
  const isEvaluating = ref(false);
  const currentDepth = ref(0);
  const nodesPerSecond = ref(0);
  const multiPvInfo = ref<MultiPvInfo[]>([]);

  const currentTurnColor = computed(() => parseFen(fen.value).unwrap().turn);
  const multiPvOption = computed(() => options?.multipv?.value[0] ?? 1);

  const sidecar = Command.sidecar("bin/stockfish");
  const child = await sidecar.spawn();

  function sendAndWaitForCommand<T>(
    input: string,
    getResult: (command: ReturnType<typeof tryParseOne>) => T | undefined
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const resolveOnCommand = (line: string) => {
        const result = getResult(tryParseOne(line.trim()));
        if (result === undefined) return;

        sidecar.stdout.removeListener("data", resolveOnCommand);
        resolve(result);
      };

      sidecar.stdout.on("data", resolveOnCommand);
      child.write(input).catch((error) => {
        sidecar.stdout.removeListener("data", resolveOnCommand);
        reject(error);
      });
    });
  }

  const engineName = await sendAndWaitForCommand("uci\n", (command) => {
    if (command instanceof IdCommand && command.kind === "name") return command.value;
  });

  sidecar.stderr.on("data", (line) => console.error(line));
  sidecar.stdout.on("data", onEngineResponse);
  // TODO: get threads/hash size from system
  await Promise.all([child.write(`setoption name Threads value 1\n`), child.write(`setoption name Hash value 32\n`)]);

  const stopEvaluationWatch = watch(
    [fen, isEvaluationEnabled, options?.depth, options?.multipv],
    async ([_newFen, _newIsEvaluationEnabled, _newDepth, _newMultiPv], _oldValues, onCleanup) => {
      if (isEvaluationEnabled.value === false) {
        isEvaluating.value = false;
        currentDepth.value = 0;
        nodesPerSecond.value = 0;
        multiPvInfo.value = [];
        void child.write("stop\n");
        return;
      }

      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
        isEvaluating.value = false;
        void child.write("stop\n");
      });

      const position = fen.value;
      const depth = options?.depth?.value[0];

      await child.write(`setoption name MultiPV value ${multiPvOption.value}\nposition fen ${position}\n`);
      if (cancelled) return;

      await sendAndWaitForCommand("isready\n", (command) => {
        if (command instanceof ReadyOkCommand) return true;
      });
      if (cancelled) return;

      await child.write(depth === undefined ? "go\n" : `go depth ${depth}\n`);
      if (cancelled) return;

      isEvaluating.value = true;
    }
  );

  function getEvaluatedScore(centipawns: number | undefined, mate: number | undefined): string {
    if (mate !== undefined) {
      const score = currentTurnColor.value === "white" ? mate : -mate;
      return `${score < 0 ? "-" : ""}#${Math.abs(score)}`;
    }
    if (centipawns === undefined) return "-";
    const pawnAdvantage = centipawns / 100;
    const score = currentTurnColor.value === "white" ? pawnAdvantage : -pawnAdvantage;
    if (score === 0) return "0.00";
    return `${score > 0 ? "+" : ""}${score.toFixed(2)}`;
  }

  function onEngineResponse(line: string) {
    if (!isEvaluationEnabled.value) return;

    let _depth = 0;
    let _selectiveDepth = 0;
    let _multipv: number | undefined;
    let _centipawns: number | undefined;
    let _mate: number | undefined;
    let _nodesPerSecond = 0;
    let _principleVariation: UciMove[] = [];

    const command = tryParseOne(line.trim());
    if (!command) return;
    if (command instanceof InfoCommand) {
      for (const attribute of command.attributes) {
        if (attribute instanceof DepthInfoAttr) _depth = attribute.depth;
        else if (attribute instanceof SelectiveDepthInfoAttr) _selectiveDepth = attribute.depth;
        else if (attribute instanceof MultiPrincipalVariationInfoAttr) _multipv = attribute.multiPv;
        else if (attribute instanceof ScoreInfoAttr) {
          _centipawns = attribute.centipawn;
          _mate = attribute.mate;
        } else if (attribute instanceof NpsInfoAttr) _nodesPerSecond = attribute.nps;
        else if (attribute instanceof PrincipalVariationInfoAttr) _principleVariation = attribute.moves;
      }

      // skip update if
      // * selective depth is not present
      // * multipv is not present
      // * multipv is greater than current multipv option
      if (!_selectiveDepth || !_multipv || _multipv > multiPvOption.value) return;

      currentDepth.value = _depth;
      nodesPerSecond.value = _nodesPerSecond;

      multiPvInfo.value[_multipv - 1] = {
        id: _multipv - 1,
        principleVariation: _principleVariation,
        evaluatedScore: getEvaluatedScore(_centipawns, _mate),
      };
      multiPvInfo.value = multiPvInfo.value.filter((info) => info.id < multiPvOption.value);
    } else if (command instanceof BestMoveCommand) {
      isEvaluating.value = false;
    }
  }

  async function killProcess() {
    isEvaluationEnabled.value = false;
    stopEvaluationWatch();
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
