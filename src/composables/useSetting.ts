import { db, execute, selectFirst } from "@services/database";
import { ref, watch } from "vue";

export async function useSetting(key: string, initialValue: string) {
  const getItem = async (key: string) => {
    const query = db.selectFrom("settings").select("value").where("key", "=", key).compile();
    return (await selectFirst(query)).value ?? null;
  };

  const setItem = async (key: string, value: string) => {
    const query = db
      .insertInto("settings")
      .values({ key, value })
      .onConflict((oc) => oc.column("key").doUpdateSet({ value: value }))
      .compile();
    await execute(query);
  };

  // const removeItem = async (key: string) => {
  //   const query = db.deleteFrom("settings").where("key", "=", key).compile();
  //   await execute(query);
  // };

  const setting = ref<string>("");
  watch(setting, async () => setItem(key, setting.value));
  const settingValue = await getItem(key);
  if (settingValue === null) {
    await setItem(key, initialValue);
    setting.value = initialValue;
  } else {
    setting.value = settingValue;
  }

  return setting;
}
