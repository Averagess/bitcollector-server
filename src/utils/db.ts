import mongoose from "mongoose";

import { MONGODB_URI, ENVIRONMENT, MONGODB_DEV_URI, CI } from "./config";
import { logger } from "./logger";

mongoose.set("strictQuery", false);

const connectToDatabase = async () => {
  try {
    logger.info("Attempting connecting to database");
    if (CI === "true" || (typeof CI === "boolean" && CI)) {
      logger.info("Connecting to localhost database because CI env variable was set to true");
      await mongoose.connect("mongodb://localhost:27017/test");
    } else if (ENVIRONMENT === "test" || ENVIRONMENT === "development") {
      logger.info(
        `Connecting to development database because env was set to: ${ENVIRONMENT}`
      );
      await mongoose.connect(MONGODB_DEV_URI);
      logger.info("Successfully connected to development database.");
    } else if (ENVIRONMENT === "production") {
      logger.info("Connecting to production database");
      await mongoose.connect(MONGODB_URI);
      logger.info("Successfully connected to production database.");
    } else
      throw new Error(`ENVIRONMENT was set to ${ENVIRONMENT} which is not a valid value. Valid values are: test, development, production, and ci`);
  } catch (error) {
    logger.error("Connecting to database failed. Error below");
    logger.error(error);
    process.exit(1);
  }

  return null;
};

const disconnectFromDatabase = async () => {
  try {
    logger.info("Attempting to disconnect from database.");
    await mongoose.disconnect();
    logger.info("Disconnected from database successfully.");
    return null;
  } catch (error) {
    logger.error("Disconnecting from database failed. Error below.");
    logger.error(error);
    return process.exit(1);
  }
};

export { connectToDatabase, disconnectFromDatabase };
