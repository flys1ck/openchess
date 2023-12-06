import { db, execute, selectFirst } from "@services/database";
import { StorageLikeAsync, useStorageAsync } from "@vueuse/core";

export function useSetting(key: string, initialValue: string) {
  const getItem = async (key: string) => {
    const query = db.selectFrom("settings").select("value").where("key", "=", key).compile();
    return (await selectFirst(query))?.value ?? null;
  };

  const setItem = async (key: string, value: string) => {
    const query = db
      .insertInto("settings")
      .values({ key, value })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value: value }))
      .compile();
    await execute(query);
  };

  const removeItem = async (key: string) => {
    const query = db.deleteFrom("settings").where("key", "=", key).compile();
    await execute(query);
  };

  const storage: StorageLikeAsync = {
    getItem,
    setItem,
    removeItem,
  };

  return useStorageAsync(key, initialValue, storage);
}
