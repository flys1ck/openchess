import { ChessDotComClient } from "@services/chessdotcom";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useChessDotCom = defineStore("chessDotCom", () => {
  const client = ChessDotComClient();
  const username = useLocalStorage("chessdotcomUsername", "");

  async function validateAndSetUsername(player: string) {
    const response = await client.getPlayer(player);
    if (response.code === 0) {
      return false;
    }

    username.value = player;
    return true;
  }

  return { client, username, validateAndSetUsername };
});
