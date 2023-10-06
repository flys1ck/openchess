import Database from "tauri-plugin-sql-api";

const sql = (strings: TemplateStringsArray, ...expr: any[]) =>
  strings.map((str, index) => str + (expr.length > index ? String(expr[index]) : "")).join("");

const database = await Database.load("sqlite:db.sqlite");

export async function getSetting(settingKey: string) {
  const setting = await database.select<{ setting_value: string }[]>(
    sql`select setting_value from settings where setting_key = $1`,
    [settingKey]
  );

  return setting[0].setting_value;
}

export async function setSetting(settingKey: string, settingValue: string) {
  await database.execute(sql`update settings set setting_value = $1 where setting_key = $2;`, [
    settingValue,
    settingKey,
  ]);
}
