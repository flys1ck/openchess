export * from "./src/index";
export * from "./src/client.gen";

import { createClient, createConfig } from "./src/client/index";

export const explorerClient = createClient(createConfig({ baseUrl: "https://explorer.lichess.org" }));
