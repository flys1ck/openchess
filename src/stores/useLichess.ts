import { db, execute, selectFirst } from "@services/database";
import { LichessClient } from "@services/lichess";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useLichess = defineStore("lichess", () => {
  const personalAccessToken = ref("");
  const username = ref("");
  const client = new LichessClient(personalAccessToken.value);

  async function setPersonalAccessToken() {
    const query = db
      .selectFrom("settings")
      .select("setting_value")
      .where("setting_key", "=", "lichess_token")
      .compile();
    const { setting_value: lichessToken } = await selectFirst(query);

    if (!lichessToken) return;

    client.personalAccessToken = lichessToken;
    const response = await client.getCurrentAccount();
    if (response.error) {
      // reset token to previous one
      username.value = response.username;
      client.personalAccessToken = personalAccessToken.value;
      return;
    }

    username.value = response.username;
    client.personalAccessToken = lichessToken;
    personalAccessToken.value = lichessToken;
  }

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

    const query = db
      .updateTable("settings")
      .set({ setting_value: token })
      .where("setting_key", "=", "lichess_token")
      .compile();
    await execute(query);

    return true;
  }

  function clearToken() {
    personalAccessToken.value = "";
    username.value = "";
    client.personalAccessToken = "";
  }

  return {
    personalAccessToken,
    username,
    client,
    validateAndSetPersonalAccessToken,
    setPersonalAccessToken,
    clearToken,
  };
});
