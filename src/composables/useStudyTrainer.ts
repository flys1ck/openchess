import { useGame } from "@composables/useGame";
import {
  countStudentMoves,
  countStudentMovesPlayed,
  isExpectedMove,
  shouldAutoPlayMove,
} from "@utilities/studyTrainer";
import { Color, Key } from "chessground/types";
import { computed, onUnmounted, ref } from "vue";

export type TrainerStatus = "playing" | "complete";
export type TrainerFeedback = "move" | "retry" | "complete";

const OPPONENT_DELAY_MS = 400;
const HINT_AFTER_MISTAKES = 2;

export function useStudyTrainer(game: ReturnType<typeof useGame>) {
  const status = ref<TrainerStatus>("playing");
  const feedback = ref<TrainerFeedback>("move");
  const studentColor = ref<Color>("white");
  const mistakesOnPly = ref(0);
  const hintVisible = ref(false);
  let replyTimer: ReturnType<typeof setTimeout> | undefined;

  const expectedMove = computed(() => game.tree.activeNode.value?.nextPosition?.move);

  const comment = computed(() => game.tree.activeNode.value?.comment);

  const studentMovesTotal = computed(() => countStudentMoves(game.tree.root.value, studentColor.value));

  const studentMovesMade = computed(() => countStudentMovesPlayed(game.tree.activeNode.value, studentColor.value));

  const progressPercent = computed(() => {
    if (studentMovesTotal.value === 0) return status.value === "complete" ? 100 : 0;
    return (studentMovesMade.value / studentMovesTotal.value) * 100;
  });

  const canHint = computed(() => status.value === "playing" && !!expectedMove.value && expectedMove.value.san !== "--");

  function clearReplyTimer() {
    if (replyTimer === undefined) return;
    clearTimeout(replyTimer);
    replyTimer = undefined;
  }

  function clearHint() {
    hintVisible.value = false;
    game.setAutoShapes([]);
  }

  function showHint() {
    const move = expectedMove.value;
    if (!move || move.san === "--") return;
    hintVisible.value = true;
    game.setAutoShapes([{ brush: "green", orig: move.source, dest: move.destination }]);
  }

  function completeLine() {
    status.value = "complete";
    feedback.value = "complete";
    clearHint();
    game.setMovableColor("none");
  }

  function handleMoveGuard(source: Key, destination: Key) {
    if (status.value !== "playing") return false;
    const expected = expectedMove.value;
    if (!expected || expected.san === "--") return false;
    if (isExpectedMove(expected, source, destination, expected.piece.role)) {
      feedback.value = "move";
      mistakesOnPly.value = 0;
      return true;
    }
    mistakesOnPly.value += 1;
    feedback.value = "retry";
    if (mistakesOnPly.value >= HINT_AFTER_MISTAKES) showHint();
    return false;
  }

  function playOpponentUntilStudentTurn(delay = OPPONENT_DELAY_MS) {
    const next = game.tree.activeNode.value?.nextPosition;
    if (!next) {
      completeLine();
      return;
    }
    if (!shouldAutoPlayMove(next, studentColor.value)) return;

    clearReplyTimer();
    replyTimer = setTimeout(() => {
      game.toNextMove();
      mistakesOnPly.value = 0;
      clearHint();
      const following = game.tree.activeNode.value?.nextPosition;
      if (!following) {
        completeLine();
        return;
      }
      if (shouldAutoPlayMove(following, studentColor.value)) playOpponentUntilStudentTurn();
    }, delay);
  }

  function onMovePlayed() {
    clearHint();
    playOpponentUntilStudentTurn();
  }

  function prepare(color: Color) {
    studentColor.value = color;
    game.configureMoves({
      movableColor: color,
      moveGuard: handleMoveGuard,
      onMovePlayed,
    });
  }

  function start() {
    clearReplyTimer();
    status.value = "playing";
    feedback.value = "move";
    mistakesOnPly.value = 0;
    clearHint();
    game.setMovableColor(studentColor.value);
    game.toFirstMove();
    playOpponentUntilStudentTurn();
  }

  function restart() {
    start();
  }

  function hint() {
    if (!canHint.value) return;
    showHint();
  }

  function dispose() {
    clearReplyTimer();
  }

  onUnmounted(dispose);

  return {
    status,
    feedback,
    studentColor,
    mistakesOnPly,
    hintVisible,
    comment,
    expectedMove,
    studentMovesTotal,
    studentMovesMade,
    progressPercent,
    canHint,
    prepare,
    start,
    restart,
    hint,
    dispose,
  };
}
