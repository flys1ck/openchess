import { ChessDotComClient } from "@/services/chessdotcom";
import { defineStore } from "pinia";

export const useChessDotCom = defineStore("chessDotCom", () => {
  const client = ChessDotComClient();

  return { client };
});
