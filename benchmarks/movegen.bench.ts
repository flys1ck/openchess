import { Chess as ChessJS } from "chess.js";
import { Chess as ChessOps } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { bench, describe } from "vitest";

describe("chess.js movegen", () => {
  // for positions see https://www.chessprogramming.org/Perft_Results
  // result time in seconds
  bench("initial", () => {
    const chess = new ChessJS("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chess.moves();
  });

  bench("position 2", () => {
    const chess = new ChessJS("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -");
    chess.moves();
  });

  bench("position 3", () => {
    const chess = new ChessJS("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -");
    chess.moves();
  });

  bench("position 4", () => {
    const chess = new ChessJS("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    chess.moves();
  });

  bench("position 5", () => {
    const chess = new ChessJS("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8");
    chess.moves();
  });

  bench("kiwipete", () => {
    const chess = new ChessJS("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    chess.moves();
  });
});

describe("chessops movegen", () => {
  // for positions see https://www.chessprogramming.org/Perft_Results
  // result time in seconds
  bench("initial", () => {
    const setup = parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });

  bench("position 2", () => {
    const setup = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });

  bench("position 3", () => {
    const setup = parseFen("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });

  bench("position 4", () => {
    const setup = parseFen("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });

  bench("position 5", () => {
    const setup = parseFen("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });

  bench("kiwipete", () => {
    const setup = parseFen("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1").unwrap();
    const position = ChessOps.fromSetup(setup).unwrap();
    position.allDests();
  });
});
