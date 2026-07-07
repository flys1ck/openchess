#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use diesel::{Connection, SqliteConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::path;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            let app_data_path =
                path::Path::new(&app.path().data_dir().unwrap()).join("com.openchess.dev");
            let database_path = app_data_path.join("db.sqlite");
            assert!(
                app_data_path.exists() || std::fs::create_dir(&app_data_path).is_ok(),
                "Error creating app data directory at {:?}",
                app_data_path.to_str().unwrap()
            );

            pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();
            let database_url = database_path
                .to_str()
                .unwrap_or_else(|| panic!("Error convert path {:?} to url", database_path));
            let mut connection = SqliteConnection::establish(&database_url)
                .unwrap_or_else(|_| panic!("Error connecting to {}", &database_url));
            connection
                .run_pending_migrations(MIGRATIONS)
                .unwrap_or_else(|_| panic!("Migrations could not be ran"));
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {}))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
