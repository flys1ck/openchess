#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod engine;
mod engine_commands;
mod state;

use engine::Engine;
use state::State;

fn main() {
    fix_path_env::fix().expect("fixes env");
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(State {
            engine: Engine::new().into(),
        })
        .invoke_handler(tauri::generate_handler![
            engine_commands::begin_evaluation,
            engine_commands::stop_evaluation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
