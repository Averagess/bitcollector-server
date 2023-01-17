import mongoose from "mongoose"
import config from "./config"

const { MONGODB_URI } = config


const connectToDatabase = async () => {
  try {
    console.log("Attemting to connect to database")
    await mongoose.connect(MONGODB_URI)
    console.log("connected to database");
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