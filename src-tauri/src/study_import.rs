use diesel::{
    connection::SimpleConnection,
    sql_query,
    sql_types::{Integer, Nullable, Text},
    Connection, QueryResult, QueryableByName, RunQueryDsl, SqliteConnection,
};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::{ipc::Channel, State};

pub struct DatabasePath(pub PathBuf);

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ImportTarget {
    ExistingStudy {
        id: i32,
    },
    NewStudy {
        name: String,
        description: Option<String>,
    },
}

#[derive(Debug, Deserialize)]
pub struct ImportPlan {
    pub chapters: Vec<PlannedChapter>,
}

#[derive(Debug, Deserialize)]
pub struct PlannedChapter {
    pub name: String,
    pub lines: Vec<PlannedLine>,
}

#[derive(Debug, Deserialize)]
pub struct PlannedLine {
    pub name: String,
    pub pgn: String,
    pub moves: String,
    pub orientation: String,
    pub positions: Vec<PlannedPosition>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlannedPosition {
    pub position_key: String,
    pub ply: i32,
    pub halfmove_clock: i32,
    pub fullmove_number: i32,
    pub source: String,
    pub destination: String,
    pub san: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportProgress {
    pub imported_lines: usize,
    pub total_lines: usize,
}

#[derive(QueryableByName)]
struct Id {
    #[diesel(sql_type = Integer)]
    id: i32,
}

#[tauri::command]
pub async fn import_study(
    database_path: State<'_, DatabasePath>,
    target: ImportTarget,
    plan: ImportPlan,
    on_progress: Channel<ImportProgress>,
) -> Result<i32, String> {
    let database_path = database_path.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut connection = open_connection(&database_path)?;
        import_plan(&mut connection, &target, &plan, |progress| {
            let _ = on_progress.send(progress);
        })
        .map_err(|error| error.to_string())
    })
    .await
    .map_err(|error| error.to_string())?
}

// The SQL plugin's connection pool can't hold a transaction across invoke calls, so the import opens its own connection
fn open_connection(database_path: &Path) -> Result<SqliteConnection, String> {
    let database_url = database_path
        .to_str()
        .ok_or_else(|| format!("Database path {database_path:?} is not valid UTF-8"))?;
    let mut connection =
        SqliteConnection::establish(database_url).map_err(|error| error.to_string())?;
    connection
        .batch_execute("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;")
        .map_err(|error| error.to_string())?;
    Ok(connection)
}

pub fn import_plan(
    connection: &mut SqliteConnection,
    target: &ImportTarget,
    plan: &ImportPlan,
    mut on_progress: impl FnMut(ImportProgress),
) -> QueryResult<i32> {
    let total_lines = plan
        .chapters
        .iter()
        .map(|chapter| chapter.lines.len())
        .sum();

    connection.immediate_transaction(|connection| {
        let study_id = match target {
            ImportTarget::ExistingStudy { id } => {
                sql_query("select id from studies where id = ?")
                    .bind::<Integer, _>(id)
                    .get_result::<Id>(connection)?
                    .id
            }
            ImportTarget::NewStudy { name, description } => {
                sql_query("insert into studies (name, description) values (?, ?) returning id")
                    .bind::<Text, _>(name)
                    .bind::<Nullable<Text>, _>(description)
                    .get_result::<Id>(connection)?
                    .id
            }
        };

        let mut imported_lines = 0;
        for chapter in &plan.chapters {
            let chapter_id = sql_query(
                "insert into chapters (study, name) values (?, ?)
                 on conflict (study, name) do update set name = excluded.name
                 returning id",
            )
            .bind::<Integer, _>(study_id)
            .bind::<Text, _>(&chapter.name)
            .get_result::<Id>(connection)?
            .id;

            for line in &chapter.lines {
                import_line(connection, chapter_id, line)?;
                imported_lines += 1;
                on_progress(ImportProgress {
                    imported_lines,
                    total_lines,
                });
            }
        }

        Ok(study_id)
    })
}

fn import_line(
    connection: &mut SqliteConnection,
    chapter_id: i32,
    line: &PlannedLine,
) -> QueryResult<()> {
    // Positions cascade and the delete_orphaned_chess_position trigger drops keys no other line uses
    sql_query("delete from lines where chapter = ? and name = ?")
        .bind::<Integer, _>(chapter_id)
        .bind::<Text, _>(&line.name)
        .execute(connection)?;

    let line_id = sql_query(
        "insert into lines (chapter, name, pgn, moves, orientation) values (?, ?, ?, ?, ?)
         returning id",
    )
    .bind::<Integer, _>(chapter_id)
    .bind::<Text, _>(&line.name)
    .bind::<Text, _>(&line.pgn)
    .bind::<Text, _>(&line.moves)
    .bind::<Text, _>(&line.orientation)
    .get_result::<Id>(connection)?
    .id;

    for position in &line.positions {
        sql_query(
            "insert into chess_positions (position_key) values (?)
             on conflict (position_key) do nothing",
        )
        .bind::<Text, _>(&position.position_key)
        .execute(connection)?;

        sql_query(
            "insert into positions
                (chess_position, line, ply, halfmove_clock, fullmove_number, source, destination, san)
             select id, ?, ?, ?, ?, ?, ?, ?
             from chess_positions
             where position_key = ?",
        )
        .bind::<Integer, _>(line_id)
        .bind::<Integer, _>(position.ply)
        .bind::<Integer, _>(position.halfmove_clock)
        .bind::<Integer, _>(position.fullmove_number)
        .bind::<Text, _>(&position.source)
        .bind::<Text, _>(&position.destination)
        .bind::<Text, _>(&position.san)
        .bind::<Text, _>(&position.position_key)
        .execute(connection)?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::MIGRATIONS;
    use diesel::sql_types::BigInt;
    use diesel_migrations::MigrationHarness;

    #[derive(QueryableByName)]
    struct Count {
        #[diesel(sql_type = BigInt)]
        count: i64,
    }

    #[derive(QueryableByName, Debug, PartialEq)]
    struct LineSummary {
        #[diesel(sql_type = Text)]
        chapter: String,
        #[diesel(sql_type = Text)]
        line: String,
        #[diesel(sql_type = Text)]
        sans: String,
    }

    fn migrated_connection() -> SqliteConnection {
        let mut connection = SqliteConnection::establish(":memory:").expect("in-memory SQLite");
        connection
            .run_pending_migrations(MIGRATIONS)
            .expect("migrations");
        connection
            .batch_execute("PRAGMA foreign_keys = ON")
            .expect("enable foreign keys");
        connection
    }

    fn line(name: &str, moves: &[(&str, &str)]) -> PlannedLine {
        PlannedLine {
            name: name.to_owned(),
            pgn: String::new(),
            moves: moves
                .iter()
                .map(|(_, san)| *san)
                .collect::<Vec<_>>()
                .join(" "),
            orientation: "white".to_owned(),
            positions: moves
                .iter()
                .enumerate()
                .map(|(ply, (position_key, san))| PlannedPosition {
                    position_key: (*position_key).to_owned(),
                    ply: ply as i32,
                    halfmove_clock: 0,
                    fullmove_number: 1,
                    source: "a1".to_owned(),
                    destination: "a2".to_owned(),
                    san: (*san).to_owned(),
                })
                .collect(),
        }
    }

    fn chapter(name: &str, lines: Vec<PlannedLine>) -> PlannedChapter {
        PlannedChapter {
            name: name.to_owned(),
            lines,
        }
    }

    fn new_study(name: &str) -> ImportTarget {
        ImportTarget::NewStudy {
            name: name.to_owned(),
            description: None,
        }
    }

    fn count(connection: &mut SqliteConnection, query: &str) -> i64 {
        sql_query(query)
            .get_result::<Count>(connection)
            .expect("count query")
            .count
    }

    fn line_summaries(connection: &mut SqliteConnection, study_id: i32) -> Vec<LineSummary> {
        sql_query(
            "select chapters.name as chapter, lines.name as line,
                coalesce((select group_concat(san, ' ') from (
                    select san from positions where line = lines.id order by ply
                )), '') as sans
             from lines
             inner join chapters on chapters.id = lines.chapter
             where chapters.study = ?
             order by chapters.name, lines.name",
        )
        .bind::<Integer, _>(study_id)
        .load(connection)
        .expect("line summaries")
    }

    fn summary(chapter: &str, line: &str, sans: &str) -> LineSummary {
        LineSummary {
            chapter: chapter.to_owned(),
            line: line.to_owned(),
            sans: sans.to_owned(),
        }
    }

    const ORPHANED_CHESS_POSITIONS: &str = "select count(*) as count from chess_positions
        where id not in (select chess_position from positions)";

    #[test]
    fn imports_a_plan_into_a_new_study() {
        let mut connection = migrated_connection();
        let plan = ImportPlan {
            chapters: vec![
                chapter(
                    "Chapter 1",
                    vec![
                        line("Main", &[("start", "d4"), ("after d4", "d5")]),
                        line("Text only", &[]),
                    ],
                ),
                chapter("Chapter 2", vec![line("Side", &[("start", "c4")])]),
            ],
        };
        let mut progress = Vec::new();

        let study_id = import_plan(&mut connection, &new_study("Repertoire"), &plan, |update| {
            progress.push(update)
        })
        .expect("import");

        assert_eq!(
            line_summaries(&mut connection, study_id),
            vec![
                summary("Chapter 1", "Main", "d4 d5"),
                summary("Chapter 1", "Text only", ""),
                summary("Chapter 2", "Side", "c4"),
            ]
        );
        assert_eq!(
            count(
                &mut connection,
                "select count(*) as count from chess_positions"
            ),
            2
        );
        assert_eq!(
            progress
                .iter()
                .map(|update| (update.imported_lines, update.total_lines))
                .collect::<Vec<_>>(),
            vec![(1, 3), (2, 3), (3, 3)]
        );
    }

    #[test]
    fn reimport_replaces_lines_and_drops_unused_positions() {
        let mut connection = migrated_connection();
        let first = ImportPlan {
            chapters: vec![chapter(
                "Chapter",
                vec![
                    line("Main", &[("start", "e4"), ("after e4", "e5")]),
                    line("Other", &[("start", "c4")]),
                ],
            )],
        };
        let study_id = import_plan(&mut connection, &new_study("Repertoire"), &first, |_| {})
            .expect("first import");

        let second = ImportPlan {
            chapters: vec![chapter(
                "Chapter",
                vec![line("Main", &[("start", "d4"), ("after d4", "d5")])],
            )],
        };
        import_plan(
            &mut connection,
            &ImportTarget::ExistingStudy { id: study_id },
            &second,
            |_| {},
        )
        .expect("re-import");

        assert_eq!(
            line_summaries(&mut connection, study_id),
            vec![
                summary("Chapter", "Main", "d4 d5"),
                summary("Chapter", "Other", "c4"),
            ]
        );
        assert_eq!(
            count(&mut connection, "select count(*) as count from chapters"),
            1
        );
        assert_eq!(count(&mut connection, ORPHANED_CHESS_POSITIONS), 0);
        assert_eq!(
            count(
                &mut connection,
                "select count(*) as count from chess_positions"
            ),
            2
        );
    }

    #[test]
    fn merges_into_an_existing_study_without_touching_other_studies() {
        let mut connection = migrated_connection();
        let shared_plan = ImportPlan {
            chapters: vec![chapter("Chapter", vec![line("Main", &[("start", "e4")])])],
        };
        let other_study = import_plan(&mut connection, &new_study("Other"), &shared_plan, |_| {})
            .expect("other study");
        let study_id = import_plan(
            &mut connection,
            &new_study("Repertoire"),
            &shared_plan,
            |_| {},
        )
        .expect("study");

        let plan = ImportPlan {
            chapters: vec![
                chapter("Chapter", vec![line("Main", &[("start", "d4")])]),
                chapter("New chapter", vec![line("Fresh", &[("start", "c4")])]),
            ],
        };
        import_plan(
            &mut connection,
            &ImportTarget::ExistingStudy { id: study_id },
            &plan,
            |_| {},
        )
        .expect("merge import");

        assert_eq!(
            line_summaries(&mut connection, study_id),
            vec![
                summary("Chapter", "Main", "d4"),
                summary("New chapter", "Fresh", "c4"),
            ]
        );
        assert_eq!(
            line_summaries(&mut connection, other_study),
            vec![summary("Chapter", "Main", "e4")]
        );
    }

    #[test]
    fn a_failing_line_rolls_back_the_whole_import() {
        let mut connection = migrated_connection();
        let mut broken_line = line("Broken", &[("after d4", "d5")]);
        broken_line.orientation = "sideways".to_owned();
        let plan = ImportPlan {
            chapters: vec![chapter(
                "Chapter",
                vec![line("Main", &[("start", "d4")]), broken_line],
            )],
        };

        let result = import_plan(&mut connection, &new_study("Repertoire"), &plan, |_| {});

        assert!(result.is_err());
        for table in [
            "studies",
            "chapters",
            "lines",
            "positions",
            "chess_positions",
        ] {
            assert_eq!(
                count(
                    &mut connection,
                    &format!("select count(*) as count from {table}")
                ),
                0,
                "{table} should be empty"
            );
        }
    }

    #[test]
    fn rejects_a_missing_study() {
        let mut connection = migrated_connection();
        let plan = ImportPlan {
            chapters: vec![chapter("Chapter", vec![line("Main", &[("start", "d4")])])],
        };

        let result = import_plan(
            &mut connection,
            &ImportTarget::ExistingStudy { id: 42 },
            &plan,
            |_| {},
        );

        assert!(matches!(result, Err(diesel::result::Error::NotFound)));
        assert_eq!(
            count(&mut connection, "select count(*) as count from chapters"),
            0
        );
    }
}
