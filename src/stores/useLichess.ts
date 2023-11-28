import { LichessClient } from "@services/lichess";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useLichess = defineStore("lichess", () => {
  const personalAccessToken = useLocalStorage("lichessToken", "");
  const username = useLocalStorage("lichessUsername", "");
  const client = LichessClient(personalAccessToken.value);

  async function validateAndSetPersonalAccessToken(token: string) {
    client.personalAccessToken = token;
    const response = await client.getCurrentAccount();
    if (response.error) {
      // reset token to previous one
      username.value = response.username;
      client.personalAccessToken = personalAccessToken.value;
      return false;
    }

    username.value = response.username;
    client.personalAccessToken = token;
    personalAccessToken.value = token;
    return true;
  }

  return {
    personalAccessToken,
    username,
    client,
    validateAndSetPersonalAccessToken,
  };
});
