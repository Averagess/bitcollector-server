import { connectToDatabase, disconnectFromDatabase } from "./utils/db";
import { PORT } from "./utils/config";

import app from "./app";
import { logger } from "./utils/logger";

connectToDatabase();


app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received. Shutting down gracefully");
  await disconnectFromDatabase();
  process.exit(0);
});