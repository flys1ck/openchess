import { useSetting } from "@composables/useSetting";
import { ChessDotComClient } from "@services/chessdotcom";
import { defineStore } from "pinia";

const username = await useSetting("chessdotcomUsername", "");
export const useChessDotCom = defineStore("chessDotCom", () => {
  const client = ChessDotComClient();

  async function validateAndSetUsername(player: string) {
    const response = await client.getPlayer(player);
    if (response.code === 0) return false;

    username.value = player;
    return true;
  }

  return { client, username, validateAndSetUsername };
});
