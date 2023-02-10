import { createClient } from "redis";
import { REDIS_URL } from "./config";

import { logger } from "./logger";

const client = createClient({ url: REDIS_URL });

const connectToCache = async () => {
  try {
    logger.info(`Connecting to Redis cache at ${REDIS_URL}...`);
    await client.connect();
    logger.info("Successfully connected to Redis cache.");
  } catch (error) {
    logger.error("Failed to connect to Redis cache! Error below.");
    logger.error(error);
    process.exit(1);
  }
  return null;
};

const disconnectFromCache = async () => {
  try {
    logger.info("Disconnecting from Redis cache...");
    await client.disconnect();
    logger.info("Successfully disconnected from Redis cache.");
  } catch (error) {
    logger.info("Failed to disconnect from Redis cache! Error below.");
    logger.error(error);
    process.exit(1);
  }
  return null;
};

export { client, connectToCache, disconnectFromCache };