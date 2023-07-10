#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod engine;
mod engine_commands;
mod game_commands;
mod state;

use chess::Game;
use engine::Engine;
use state::State;

fn main() {
    fix_path_env::fix().expect("fixes env");
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(State {
            game: Game::new().into(),
            engine: Engine::new().into(),
        })
        .invoke_handler(tauri::generate_handler![
            game_commands::get_next_move,
            game_commands::create_new_game,
            game_commands::set_position,
            game_commands::parse_pgn,
            engine_commands::begin_evaluation,
            engine_commands::stop_evaluation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
