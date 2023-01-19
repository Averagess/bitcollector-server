import mongoose from "mongoose"
import config from "./config"

const { MONGODB_URI, ENVIRONMENT, MONGODB_TEST_URI } = config

import { logger } from "./logger"

mongoose.set("strictQuery", false)

const connectToDatabase = async () => {
  try {
    logger.info("Attempting connecting to database")
    if (ENVIRONMENT === "test" || ENVIRONMENT === "development") {
      logger.info(`Connecting to DEV database because env was set to: ${ENVIRONMENT}`)
      if(!MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not defined in .env file, and ENVIRONMENT was set to " + ENVIRONMENT)
      await mongoose.connect(MONGODB_TEST_URI)

    } else{
      logger.info(`Connecting to production database`)
      await mongoose.connect(MONGODB_URI)
      logger.info(`Successfully connected to database`)
    }
  } catch (error) {
    logger.error("Connection to database failed. Error below");
    logger.error(error)
    return process.exit(1);
  }

  return null;
}

const disconnectFromDatabase = async () => {
  try {
    logger.info("Attempting to disconnect from database")
    await mongoose.disconnect()
    logger.info("Disconnected from database successfully");
    return null
  } catch (error) {
    logger.error("Disconnecting from database failed. Error below");
    logger.error(error)
    return process.exit(1);
  }
}

export { connectToDatabase, disconnectFromDatabase }