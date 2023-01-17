import express from "express";

import { consoleLogger, fileLogger } from "./utils/logger";
import { connectToDatabase, disconnectFromDatabase } from "./utils/db";
import config from "./utils/config";
import getRouter from "./routes/getters";
import postRouter from "./routes/posters";

const PORT = config.PORT;
const app = express();
connectToDatabase();

app.use(express.json());
app.use(consoleLogger);
app.use(fileLogger);



app.use("/", getRouter);
app.use("/", postRouter)



app.listen(PORT, () => {
  console.log("Server listening on http://localhost:3000");
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received. Shutting down gracefully");
  await disconnectFromDatabase();
  process.exit(0);
})