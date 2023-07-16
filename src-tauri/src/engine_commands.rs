use crate::State;
use serde::{Deserialize, Serialize};
use vampirc_uci::{self, UciInfoAttribute, UciMessage};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct GoResponse {
    evaluation: Option<i32>,
    principle_variation: Option<Vec<String>>,
    depth: Option<u8>,
    source: String,
    destination: String,
    nodes_per_second: Option<u64>,
}

#[tauri::command]
pub fn begin_evaluation(state: tauri::State<State>, window: tauri::Window, fen: String) {
    let engine = state.engine.lock().unwrap();
    engine.stop();
    engine.go(fen, move |message| match message {
        UciMessage::Info(info) => {
            let mut best_move = None;
            let mut depth = None;
            let mut evaluation = None;
            let mut principle_variation = None;
            let mut nodes_per_second = None;
            info.iter().for_each(|info_item| match info_item {
                UciInfoAttribute::Pv(pv) => {
                    best_move = Some(pv.first().unwrap());
                    principle_variation = Some(
                        pv.iter()
                            .map(|pv_move| {
                                format!(
                                    "{}{}",
                                    pv_move.get_source().to_string(),
                                    pv_move.get_dest().to_string()
                                )
                            })
                            .collect(),
                    )
                }
                UciInfoAttribute::Depth(d) => depth = Some(*d),
                UciInfoAttribute::Score {
                    cp,
                    mate: _,
                    lower_bound: _,
                    upper_bound: _,
                } => evaluation = *cp,
                UciInfoAttribute::Nps(nps) => nodes_per_second = Some(*nps),
                _ => return,
            });

            if principle_variation.is_none() {
                return;
            }

            window
                .emit(
                    "bestmove",
                    GoResponse {
                        principle_variation: principle_variation,
                        depth: depth,
                        evaluation: evaluation,
                        nodes_per_second: nodes_per_second,
                        source: best_move.unwrap().get_source().to_string(),
                        destination: best_move.unwrap().get_dest().to_string(),
                    },
                )
                .unwrap()
        }
        UciMessage::BestMove {
            best_move: _,
            ponder: _,
        } => return,
        UciMessage::Unknown(_string, _error) => return,
        any => println!("Unhandled command: {any:?}"),
    });

    drop(engine)
}

#[tauri::command]
pub fn stop_evaluation(state: tauri::State<State>) {
    let engine = state.engine.lock().unwrap();
    engine.stop();
}
