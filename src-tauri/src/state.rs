use crate::Engine;

use std::sync::Mutex;

pub struct State {
    pub engine: Mutex<Engine>,
}
