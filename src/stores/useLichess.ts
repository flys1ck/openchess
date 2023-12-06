import { useSetting } from "@composables/useSetting";
import { LichessClient } from "@services/lichess";
import { defineStore } from "pinia";

export const useLichess = defineStore("lichess", () => {
  const personalAccessToken = useSetting("lichessToken", "");
  const username = useSetting("lichessUsername", "");
  const client = LichessClient(personalAccessToken.value);

  async function validateAndSetPersonalAccessToken(token: string) {
    client.setPersonalAccessToken(token);
    const response = await client.getCurrentAccount();
    if (response.error) {
      // reset token to previous one
      username.value = response.username;
      client.setPersonalAccessToken(personalAccessToken.value);
      return false;
    }

    username.value = response.username;
    client.setPersonalAccessToken(token);
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
