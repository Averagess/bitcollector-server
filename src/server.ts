import { connectToDatabase, disconnectFromDatabase } from "./utils/db";
import config from "./utils/config";

import app from "./app";
import { logger } from "./utils/logger";

const PORT = config.PORT;
connectToDatabase();


app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT signal received. Shutting down gracefully");
  await disconnectFromDatabase();
  process.exit(0);
})