import mongoose from "mongoose"
import config from "./config"

const { MONGODB_URI, ENVIRONMENT, MONGODB_TEST_URI } = config

mongoose.set("strictQuery", false)

const connectToDatabase = async () => {
  try {
    console.log("Attemting to connect to database")
    if (ENVIRONMENT === "test" || ENVIRONMENT === "development") {
      console.log("connecting to dev database because env was set to " + ENVIRONMENT)
      if(!MONGODB_TEST_URI) throw new Error("MONGODB_TEST_URI is not defined in .env file, and ENVIRONMENT was set to " + ENVIRONMENT)
      await mongoose.connect(MONGODB_TEST_URI)

    } else{
      console.log("connecting to production database")
      await mongoose.connect(MONGODB_URI)
    }
  } catch (error) {
    console.log("connecting to database failed.");
    console.log(error)
    return process.exit(1);
  }

  return null;
}

const disconnectFromDatabase = async () => {
  try {
    console.log("Attemting to disconnect from database")
    await mongoose.disconnect()
    console.log("disconnected from database");
    return null
  } catch (error) {
    console.log("disconnecting from database failed.");
    console.log(error)
    return process.exit(1);
  }
}

export { connectToDatabase, disconnectFromDatabase }