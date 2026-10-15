import { useSetting } from "@composables/useSetting";
import { client, explorerClient, getMyProfile, obtainAccessToken, revokeAccessToken } from "@flys1ck/lichess-client";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { openUrl } from "@tauri-apps/plugin-opener";
import { parseOAuthCallback } from "@utilities/deepLinks";
import { defineStore } from "pinia";
import { computed, type Ref } from "vue";
import { toast } from "vue-sonner";

const LICHESS_CLIENT_ID = "openchess";
const LICHESS_OAUTH_URL = "https://lichess.org/oauth";
const LICHESS_REDIRECT_URI = "com.openchess.dev://oauth/callback";
const LICHESS_OAUTH_TIMEOUT_MS = 3 * 60 * 1000;

async function generatePkce(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return { verifier, challenge };
}

let token: Ref<string>;
let username: Ref<string>;

export async function initLichessStore() {
  token = await useSetting("lichessToken", "");
  username = await useSetting("lichessUsername", "");
  if (token.value) {
    client.setConfig({ auth: token.value });
    explorerClient.setConfig({ auth: token.value });
  }
}

export const useLichess = defineStore("lichess", () => {
  const isConnected = computed(() => !!token.value);

  async function login() {
    try {
      const { verifier, challenge } = await generatePkce();
      const state = crypto.randomUUID();

      const params = new URLSearchParams({
        response_type: "code",
        client_id: LICHESS_CLIENT_ID,
        redirect_uri: LICHESS_REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: challenge,
        state,
      });

      const callbackPromise = new Promise<URLSearchParams>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timed out waiting for Lichess authorization"));
        }, LICHESS_OAUTH_TIMEOUT_MS);

        onOpenUrl((urls) => {
          const params = urls[0] ? parseOAuthCallback(urls[0]) : null;
          if (params) resolve(params);
        })
          .then((unlisten) => {
            void callbackPromise.finally(() => {
              clearTimeout(timeoutId);
              unlisten();
            });
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });

      await openUrl(`${LICHESS_OAUTH_URL}?${params}`);

      const callbackParams = await callbackPromise;

      if (callbackParams.get("state") !== state) {
        throw new Error("State mismatch — possible CSRF attack");
      }

      const errorDescription = callbackParams.get("error_description");
      if (errorDescription) throw new Error(errorDescription);

      const code = callbackParams.get("code");
      if (!code) throw new Error("No authorization code received");

      const tokenResponse = await obtainAccessToken({
        body: {
          grant_type: "authorization_code",
          code,
          redirect_uri: LICHESS_REDIRECT_URI,
          client_id: LICHESS_CLIENT_ID,
          code_verifier: verifier,
        },
      });

      if (tokenResponse.error || !tokenResponse.data) throw new Error("Token exchange failed");

      const { access_token } = tokenResponse.data;

      client.setConfig({ auth: access_token });
      explorerClient.setConfig({ auth: access_token });

      const profile = await getMyProfile();
      if (profile.error || !profile.data) throw new Error("Failed to fetch profile");

      token.value = access_token;
      username.value = profile.data.username ?? "";
    } catch (error) {
      toast.error("Lichess connection failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      throw error;
    }
  }

  async function logout() {
    try {
      if (token.value) await revokeAccessToken();
    } catch {
      // Token already expired or revoked — clear local state regardless
    } finally {
      client.setConfig({ auth: "" });
      explorerClient.setConfig({ auth: "" });
      token.value = "";
      username.value = "";
    }
  }

  return {
    isConnected,
    username,
    login,
    logout,
  };
});
