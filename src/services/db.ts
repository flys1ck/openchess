import Database from "tauri-plugin-sql-api";

const database = await Database.load("sqlite:db.sqlite");

export async function getSetting(settingKey: string) {
  const setting = await database.select<{ setting_value: string }[]>(
    `select setting_value from settings where setting_key = $1;`,
    [settingKey]
  );
  return setting[0].setting_value;
}

export async function setSetting(settingKey: string, settingValue: string) {
  const result = await database.execute(`update settings set setting_value = $1 where setting_key = $2;`, [
    settingValue,
    settingKey,
  ]);
  return result.rowsAffected;
}

export async function createStudy(newStudy: { name: string; description: string }) {
  const result = await database.execute(`insert into studies (name, description) values ($1, $2);`, [
    newStudy.name,
    newStudy.description,
  ]);

  return result.lastInsertId;
}

interface Study {
  id: number;
  created_at: number;
  name: string;
  description?: string;
}

export async function getStudies() {
  return await database.select<Study[]>(`select * from studies;`);
}

export async function deleteStudy(studyId: number) {
  const result = await database.execute(`delete from studies where id = $1;`, [studyId]);
  return result.rowsAffected;
}
