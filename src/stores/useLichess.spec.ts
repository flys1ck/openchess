import { openUrl } from "@tauri-apps/plugin-opener";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { toast } from "vue-sonner";
import { initLichessStore, useLichess } from "./useLichess";

type UrlHandler = (urls: string[]) => void;

const deepLink = vi.hoisted(() => ({ handler: undefined as UrlHandler | undefined }));

vi.mock("@composables/useSetting", () => ({ useSetting: async () => ref("") }));
vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl: vi.fn<(url: string) => Promise<void>>(async () => {}) }));
vi.mock("@tauri-apps/plugin-deep-link", () => ({
  onOpenUrl: vi.fn<(handler: UrlHandler) => Promise<() => void>>(async (handler) => {
    deepLink.handler = handler;
    return () => (deepLink.handler = undefined);
  }),
}));
vi.mock("vue-sonner", () => ({ toast: { error: vi.fn<() => void>() } }));
vi.mock("@flys1ck/lichess-client", () => ({
  client: { setConfig: vi.fn<() => void>() },
  explorerClient: { setConfig: vi.fn<() => void>() },
  obtainAccessToken: async () => ({ data: { access_token: "token" } }),
  getMyProfile: async () => ({ data: { username: "player" } }),
  revokeAccessToken: async () => ({}),
}));

beforeEach(async () => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  await initLichessStore();
});

async function waitForCallbackListener() {
  await vi.waitFor(() => expect(deepLink.handler).toBeDefined());
}

describe("useLichess", () => {
  it("connects when Lichess calls back", async () => {
    const lichess = useLichess();
    const login = lichess.login();
    await waitForCallbackListener();
    expect(lichess.isConnecting).toBe(true);

    const state = new URL(vi.mocked(openUrl).mock.calls[0][0]).searchParams.get("state");
    deepLink.handler?.([`com.skakia.app://oauth/callback?code=abc&state=${state}`]);
    await login;

    expect(lichess.isConnected).toBe(true);
    expect(lichess.username).toBe("player");
    expect(lichess.isConnecting).toBe(false);
  });

  it("stops waiting for the callback when cancelled", async () => {
    const lichess = useLichess();
    const login = lichess.login();
    await waitForCallbackListener();

    lichess.cancelLogin();

    await expect(login).resolves.toBeUndefined();
    expect(lichess.isConnecting).toBe(false);
    expect(lichess.isConnected).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
    expect(deepLink.handler).toBeUndefined();
  });

  it("can connect again after a cancelled attempt", async () => {
    const lichess = useLichess();
    const cancelled = lichess.login();
    await waitForCallbackListener();
    lichess.cancelLogin();
    await cancelled;

    void lichess.login();
    await waitForCallbackListener();

    expect(lichess.isConnecting).toBe(true);
  });
});
