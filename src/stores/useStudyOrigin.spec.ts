import { useGame } from "@composables/useGame";
import { navigationItems } from "@data/navigationItems";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { createMemoryHistory, createRouter, type Router } from "vue-router";
import { useStudyOrigin } from "./useStudyOrigin";

const routerHolder = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRouter: () => routerHolder.current,
}));

const GAME_PATH = "/games/lichess/abc";
const LINE_PATH = "/studies/1/chapters/2/lines/3";

const fakeGame = { fen: ref("start") } as unknown as ReturnType<typeof useGame>;

let router: Router;

beforeEach(async () => {
  setActivePinia(createPinia());
  const component = { template: "<div />" };
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/analysis", alias: "/", name: navigationItems.analysis.to, component },
      { path: "/:all(.*)", component },
    ],
  });
  routerHolder.current = router;
  await router.push("/");
});

describe("useStudyOrigin", () => {
  it("offers the way back only on study pages", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(GAME_PATH);

    studyOrigin.rememberOrigin(fakeGame);
    expect(studyOrigin.returnLink).toBeUndefined();

    await router.push(LINE_PATH);
    expect(studyOrigin.returnLink).toMatchObject({ label: "Back to game", to: GAME_PATH });
  });

  it("names the analysis board when the visit started there", async () => {
    const studyOrigin = useStudyOrigin();

    studyOrigin.rememberOrigin(fakeGame);
    await router.push(LINE_PATH);

    expect(studyOrigin.returnLink).toMatchObject({ label: "Back to analysis", to: "/" });
  });

  it("keeps the original game when moving between study lines", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(GAME_PATH);
    studyOrigin.rememberOrigin(fakeGame);
    await router.push(LINE_PATH);

    studyOrigin.rememberOrigin({ fen: ref("other") } as unknown as ReturnType<typeof useGame>);
    await router.push("/studies/1/chapters/2/lines/4");

    expect(studyOrigin.returnLink?.to).toBe(GAME_PATH);
    expect(studyOrigin.returnLink?.game).toBe(fakeGame);
  });

  it("does not offer a way back when the study was opened directly", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(LINE_PATH);

    studyOrigin.rememberOrigin(fakeGame);

    expect(studyOrigin.returnLink).toBeUndefined();
  });

  it("hands the game back once, with its refs intact", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(GAME_PATH);
    studyOrigin.rememberOrigin(fakeGame);
    await router.push(LINE_PATH);
    await router.push(GAME_PATH);

    const game = studyOrigin.takeGame(GAME_PATH);

    expect(game).toBe(fakeGame);
    expect(game?.fen.value).toBe("start");
    expect(studyOrigin.takeGame(GAME_PATH)).toBeUndefined();
  });

  it("does not hand the game to a different page", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(GAME_PATH);
    studyOrigin.rememberOrigin(fakeGame);
    await router.push(LINE_PATH);

    expect(studyOrigin.takeGame("/games/lichess/other")).toBeUndefined();
    expect(studyOrigin.returnLink?.game).toBe(fakeGame);
  });

  it("forgets the game when leaving the studies for another page", async () => {
    const studyOrigin = useStudyOrigin();
    await router.push(GAME_PATH);
    studyOrigin.rememberOrigin(fakeGame);
    await router.push(LINE_PATH);

    await router.push("/games/");
    await router.push(LINE_PATH);

    expect(studyOrigin.returnLink).toBeUndefined();
    expect(studyOrigin.takeGame(GAME_PATH)).toBeUndefined();
  });
});
