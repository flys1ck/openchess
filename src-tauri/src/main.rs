#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod database;

use database::{compact_database_if_needed, CompactionOutcome};
use diesel::{connection::SimpleConnection, Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            let app_config_path = app
                .path()
                .app_config_dir()
                .expect("No app config path was found");
            std::fs::create_dir_all(&app_config_path).unwrap_or_else(|error| {
                panic!(
                    "Error creating app config directory at {}: {error}",
                    app_config_path.display()
                )
            });
            let database_path = app_config_path.join("db.sqlite");

            pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();
            let database_url = database_path
                .to_str()
                .unwrap_or_else(|| panic!("Error convert path {:?} to url", database_path));
            let mut connection = SqliteConnection::establish(database_url)
                .unwrap_or_else(|error| panic!("Error connecting to {database_url}: {error}"));
            connection
                .batch_execute("PRAGMA busy_timeout = 1000")
                .unwrap_or_else(|error| panic!("Could not set SQLite busy timeout: {error}"));
            connection
                .run_pending_migrations(MIGRATIONS)
                .unwrap_or_else(|error| panic!("Migrations could not be run: {error}"));

            match compact_database_if_needed(&mut connection) {
                Ok(CompactionOutcome::Compacted { before, after }) => {
                    let reclaimed_bytes = before
                        .allocated_bytes()
                        .and_then(|before_bytes| {
                            after
                                .allocated_bytes()
                                .map(|after_bytes| before_bytes - after_bytes)
                        })
                        .unwrap_or_default();
                    println!("Compacted SQLite database and reclaimed {reclaimed_bytes} bytes");
                }
                Ok(CompactionOutcome::Skipped(_)) => {}
                Err(error) => eprintln!("Could not compact SQLite database: {error}"),
            }
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {}))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
