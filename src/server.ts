import { connectToDatabase, disconnectFromDatabase } from "./utils/db";
import config from "./utils/config";

import app from "./app";

const PORT = config.PORT;
connectToDatabase();


app.listen(PORT, () => {
  console.log("Server listening on http://localhost:3000");
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received. Shutting down gracefully");
  await disconnectFromDatabase();
  process.exit(0);
})