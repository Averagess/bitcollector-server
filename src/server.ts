import { connectToDatabase, disconnectFromDatabase } from "./utils/db";
import { connectToCache, disconnectFromCache } from "./utils/redis";
import { PORT } from "./utils/config";

import app from "./app";
import { logger } from "./utils/logger";

(async () => {
  logger.info("Establishing connections...");
  await connectToDatabase();
  await connectToCache();
  logger.info("Connections established");
  app.listen(PORT, () => {
    logger.info(`Server listening on http://localhost:${PORT}`);
  });
})();


process.on("SIGINT", async () => {
  logger.info("SIGINT signal received. Shutting down gracefully");
  await disconnectFromDatabase();
  await disconnectFromCache();
  process.exit(0);
});