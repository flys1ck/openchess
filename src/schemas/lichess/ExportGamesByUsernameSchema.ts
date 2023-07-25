import GameSchema from "@schemas/lichess/ExportGameByIdSchema";
import { z } from "zod";

const GamesSchema = z.array(GameSchema);

export default GamesSchema;
