use crate::State;
use chess::{Board, ChessMove, Color, Game, MoveGen, Piece, Square};
use pgn_reader::{BufferedReader, SanPlus, Skip, Visitor};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, str::FromStr, sync::MutexGuard};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PositionInfo {
    fen: String,
    turn_color: String,
    possible_moves: HashMap<String, Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ExtendedPositionInfo {
    fen: String,
    turn_color: String,
    possible_moves: HashMap<String, Vec<String>>,
    is_check: bool,
}

fn get_fen(game: &MutexGuard<Game>) -> String {
    game.current_position().to_string()
}

fn get_turn_color(game: &MutexGuard<Game>) -> String {
    match game.side_to_move() {
        Color::White => "white".to_string(),
        Color::Black => "black".to_string(),
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
struct ChessPiece {
    role: String,
    color: String,
}

fn get_piece(piece_string: &str) -> String {
    match piece_string {
        "p" | "P" => "pawn".to_string(),
        "r" | "R" => "rook".to_string(),
        "b" | "B" => "bishop".to_string(),
        "q" | "Q" => "queen".to_string(),
        "k" | "K" => "king".to_string(),
        "n" | "N" => "knight".to_string(),
        _ => todo!(),
    }
}

fn get_possible_moves(game: &MutexGuard<Game>) -> HashMap<String, Vec<String>> {
    let board = game.current_position();
    let mut possible_moves = HashMap::new();
    MoveGen::new_legal(&board).for_each(|chess_move| {
        let source = chess_move.get_source().to_string();
        let destination = chess_move.get_dest().to_string();
        possible_moves
            .entry(source)
            .or_insert_with(Vec::new)
            .push(destination)
    });

    possible_moves
}

#[tauri::command]
pub fn create_new_game(state: tauri::State<State>) -> Result<PositionInfo, ()> {
    let mut game = state.game.lock().unwrap();
    *game = Game::new();

    Ok(PositionInfo {
        fen: get_fen(&game),
        turn_color: get_turn_color(&game),
        possible_moves: get_possible_moves(&game),
    })
}

#[tauri::command]
pub fn set_position(state: tauri::State<State>, fen: String) -> Result<PositionInfo, ()> {
    let mut game = state.game.lock().unwrap();
    *game = Game::new_with_board(Board::from_str(&fen).expect("correct fen"));

    Ok(PositionInfo {
        fen: get_fen(&game),
        turn_color: get_turn_color(&game),
        possible_moves: get_possible_moves(&game),
    })
}

#[tauri::command]
pub fn get_next_move(
    state: tauri::State<State>,
    fen: String,
    source: String,
    destination: String,
    promotion_piece: String,
) -> Result<ExtendedPositionInfo, ()> {
    let piece = match promotion_piece.as_str() {
        "queen" => Some(Piece::Queen),
        "rook" => Some(Piece::Rook),
        "bishop" => Some(Piece::Bishop),
        "knight" => Some(Piece::Knight),
        _ => None,
    };

    let chess_move = ChessMove::new(
        Square::from_str(&source).expect("Valid move"),
        Square::from_str(&destination).expect("Valid move"),
        piece,
    );

    let mut game = state.game.lock().unwrap();
    *game = Game::new_with_board(Board::from_str(&fen).expect("correct fen"));
    game.make_move(chess_move);

    let is_check = game.current_position().checkers().popcnt() > 0;

    // TODO: contains info, which is not used
    Ok(ExtendedPositionInfo {
        fen: get_fen(&game),
        turn_color: get_turn_color(&game),
        possible_moves: get_possible_moves(&game),
        is_check,
    })
}

struct ChessGame {
    game: Game,
    ply: usize,
    node: GameNode,
    nodes: Vec<GameNode>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChessMove2 {
    source: String,
    destination: String,
    piece: ChessPiece,
    is_check: bool,
    is_capture: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameNode {
    fen: String,
    ply: usize,
    possible_moves: HashMap<String, Vec<String>>,
    chess_move: Option<ChessMove2>,
    comment: String,
}

impl ChessGame {
    fn new() -> ChessGame {
        let game = Game::new();
        let board = game.current_position();
        let mut possible_moves = HashMap::new();
        MoveGen::new_legal(&board).for_each(|chess_move| {
            let source = chess_move.get_source().to_string();
            let destination = chess_move.get_dest().to_string();
            possible_moves
                .entry(source)
                .or_insert_with(Vec::new)
                .push(destination)
        });

        ChessGame {
            game,
            ply: 0,
            nodes: Vec::new(),
            node: GameNode {
                fen: board.to_string(),
                ply: 0,
                possible_moves,
                chess_move: None,
                comment: "".to_string(),
            },
        }
    }
}

// TODO: better parse it into game and then process game (slower??)
impl Visitor for ChessGame {
    type Result = Vec<GameNode>;

    fn san(&mut self, san_plus: SanPlus) {
        self.nodes.push(self.node.clone());
        self.ply += 1;
        self.node.ply = self.ply;
        self.node.comment = "".to_string();

        let mut board = self.game.current_position();
        let chess_move =
            ChessMove::from_san(&board, &san_plus.san.to_string()).expect("valid move");

        self.node.chess_move = Some(ChessMove2 {
            source: chess_move.get_source().to_string(),
            destination: chess_move.get_dest().to_string(),
            piece: ChessPiece {
                role: get_piece(
                    &board
                        .piece_on(chess_move.get_source())
                        .expect("valid piece")
                        .to_string(self.game.side_to_move()),
                ),
                color: match self.game.side_to_move() {
                    Color::White => "white".to_string(),
                    Color::Black => "black".to_string(),
                },
            },
            is_check: board.checkers().popcnt() > 0,
            is_capture: board.piece_on(chess_move.get_dest()).is_some(),
        });
        self.game.make_move(chess_move);

        board = self.game.current_position();
        self.node.fen = board.to_string();

        let mut possible_moves = HashMap::new();
        MoveGen::new_legal(&board).for_each(|chess_move| {
            let source = chess_move.get_source().to_string();
            let destination = chess_move.get_dest().to_string();
            possible_moves
                .entry(source)
                .or_insert_with(Vec::new)
                .push(destination)
        });
        self.node.possible_moves = possible_moves;
    }

    fn comment(&mut self, comment: pgn_reader::RawComment<'_>) {
        self.node.comment = std::str::from_utf8(comment.as_bytes())
            .expect("comment")
            .trim()
            .to_string()
    }

    fn begin_variation(&mut self) -> Skip {
        Skip(true) // TODO: stay in the mainline
    }

    fn end_game(&mut self) -> Self::Result {
        self.nodes.clone()
    }
}

#[tauri::command]
pub fn parse_pgn(pgn: String) -> Result<Vec<GameNode>, ()> {
    let mut reader = BufferedReader::new_cursor(&pgn[..]);

    let mut game = ChessGame::new();
    let nodes = reader.read_game(&mut game).expect("worked");

    match nodes {
        Some(nodes) => Ok(nodes),
        None => Ok(Vec::new()),
    }
}
