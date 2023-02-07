import cors from "cors";
import express from "express";

import authenticator from "./middleware/authenticator";

import getRouter from "./routes/getters";
import loginRouter from "./routes/login";
import postRouter from "./routes/posters";
import putRouter from "./routes/putters";
import webhookRouter from "./routes/webhooks";

import { ENVIRONMENT } from "./utils/config";
import { fileLogger, httpConsoleLogger, logger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(cors());
app.use(httpConsoleLogger);
app.use(fileLogger);
app.use("/login", loginRouter); // Login route is not protected by authenticator

if(ENVIRONMENT === "development") {
  logger.warn("Development environment detected. Disabling authenticator middleware.");
} else {
  app.use(authenticator);
}
app.use("/api", getRouter);
app.use("/api", postRouter);
app.use("/api", putRouter);
app.use("/webhooks", webhookRouter);

export default app;
