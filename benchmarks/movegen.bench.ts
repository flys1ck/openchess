import { Chess } from "chess.js";
import { bench, describe } from "vitest";

describe("movegen", () => {
  // for positions see https://www.chessprogramming.org/Perft_Results
  // result time in seconds
  bench("initial", () => {
    const chess = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    chess.moves();
  });

  bench("position 2", () => {
    const chess = new Chess("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -");
    chess.moves();
  });

  bench("position 3", () => {
    const chess = new Chess("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -");
    chess.moves();
  });

  bench("position 4", () => {
    const chess = new Chess("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1");
    chess.moves();
  });

  bench("position 5", () => {
    const chess = new Chess("rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8");
    chess.moves();
  });

  bench("kiwipete", () => {
    const chess = new Chess("r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1");
    chess.moves();
  });
});
