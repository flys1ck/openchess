use crate::Engine;
use chess::Game;

use std::sync::Mutex;

pub struct State {
    pub game: Mutex<Game>,
    pub engine: Mutex<Engine>,
}
