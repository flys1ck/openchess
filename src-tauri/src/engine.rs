use crossbeam::channel::{unbounded, Receiver, Sender};
use std::{
    io::{BufRead, BufReader, Write},
    process::{Command, Stdio},
    thread,
};
use vampirc_uci::{self, UciMessage};

pub struct Engine {
    command_sender: Sender<String>,
    response_receiver: Receiver<String>,
}

impl Engine {
    pub fn new() -> Engine {
        let mut child = Command::new("./assets/stockfish")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .expect("stockfish failed to start");

        let mut stdin = child.stdin.take().unwrap();
        let stdout = child.stdout.take().unwrap();

        let (command_sender, command_receiver) = unbounded::<String>();
        let (response_sender, response_receiver) = unbounded::<String>();

        thread::spawn(move || {
            for command in command_receiver {
                stdin.write(command.as_bytes()).unwrap();
            }
        });

        thread::spawn(move || {
            let mut reader = BufReader::new(stdout);
            loop {
                let mut command_buffer = String::new();
                match reader.read_line(&mut command_buffer) {
                    Ok(_) => {
                        response_sender.send(command_buffer).unwrap();
                    }
                    Err(e) => println!("an error!: {:?}", e),
                }
            }
        });

        Engine {
            command_sender: command_sender,
            response_receiver: response_receiver,
        }
    }

    pub fn go<T: 'static + Send + Fn(&UciMessage)>(&self, fen: String, callback: T) {
        let command_sender = self.command_sender.clone();
        command_sender
            .send(format!("position fen {fen}\n"))
            .unwrap();
        command_sender.send("go depth 99\n".to_string()).unwrap();

        let response_receiver = self.response_receiver.clone();

        thread::spawn(move || {
            for response in response_receiver {
                let parsed_response = vampirc_uci::parse_one(&response);
                match parsed_response {
                    UciMessage::BestMove {
                        best_move: _best_move,
                        ponder: _ponder,
                    } => break,
                    _ => callback(&parsed_response),
                }
            }
        });
    }

    pub fn stop(&self) {
        let command_sender = self.command_sender.clone();
        command_sender.send("stop\n".to_string()).unwrap();
    }
}
