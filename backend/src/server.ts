import { createServer } from "node:http";

import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`SynTrace backend listening on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully.`);
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));