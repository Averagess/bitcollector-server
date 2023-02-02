import express from "express";
import cors from "cors";

import authenticator from "./middleware/authenticator";

import getRouter from "./routes/getters";
import postRouter from "./routes/posters";
import putRouter from "./routes/putters";
import loginRouter from "./routes/login";
import webhookRouter from "./routes/webhooks";

import { httpConsoleLogger, fileLogger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(cors());
app.use(httpConsoleLogger);
app.use(fileLogger);
app.use("/login", loginRouter); // Login route is not protected by authenticator
app.use(authenticator);
app.use("/api", getRouter);
app.use("/api", postRouter);
app.use("/api", putRouter);
app.use("/webhooks", webhookRouter);

export default app;
