import { useSetting } from "@composables/useSetting";
import { client, explorerClient, getMyProfile } from "@flys1ck/lichess-client";
import { defineStore } from "pinia";
import type { Ref } from "vue";

let personalAccessToken: Ref<string>;
let username: Ref<string>;

export async function initLichessStore() {
  personalAccessToken = await useSetting("lichessToken", "");
  username = await useSetting("lichessUsername", "");
  client.setConfig({ auth: personalAccessToken.value });
  explorerClient.setConfig({ auth: personalAccessToken.value });
}

export const useLichess = defineStore("lichess", () => {
  async function validateAndSetPersonalAccessToken(token: string) {
    client.setConfig({ auth: token });
    explorerClient.setConfig({ auth: token });

    const response = await getMyProfile();
    if (response.error || !response.data) {
      client.setConfig({ auth: personalAccessToken.value });
      explorerClient.setConfig({ auth: personalAccessToken.value });

      return false;
    }

    username.value = response.data.username;
    personalAccessToken.value = token;
    return true;
  }

  return {
    personalAccessToken,
    username,
    validateAndSetPersonalAccessToken,
  };
});
