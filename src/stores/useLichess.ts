import { useSupabase } from "@composables/useSupabase";
import { LichessClient } from "@services/lichess";
import { useSession } from "@stores/useSession";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useLichess = defineStore("lichess", () => {
  const supabase = useSupabase();
  const session = useSession();

  const personalAccessToken = ref("");
  const username = ref("");
  const client = new LichessClient(personalAccessToken.value);

  async function setPersonalAccessToken(userId: string) {
    const { data: user } = await supabase.from("users").select("lichess_token").eq("id", userId).single();

    if (!user || !user.lichess_token) return;

    client.personalAccessToken = user.lichess_token;
    const response = await client.getCurrentAccount();
    if (response.error) {
      // reset token to previous one
      username.value = response.username;
      client.personalAccessToken = personalAccessToken.value;
      return;
    }

    username.value = response.username;
    client.personalAccessToken = user.lichess_token;
    personalAccessToken.value = user.lichess_token;
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

    await supabase.from("users").update({ lichess_token: token }).eq("id", session.session?.user.id);

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
