export interface ChessGame {
  id: string;
  players: {
    white: {
      user: { id: string; name: string };
      rating: number;
      ratingDiff?: number;
    };
    black: {
      user: { id: string; name: string };
      rating: number;
      ratingDiff?: number;
    };
  };
  opening?: {
    name: string;
  };
  variant: string;
  moves: string;
  initialFen?: string;
  clock?: {
    initial: number;
    increment: number;
  };
  createdAt: number;
}
