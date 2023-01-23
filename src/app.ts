import express from "express";

import authenticator from "./middleware/authenticator";
import getRouter from "./routes/getters";
import postRouter from "./routes/posters";

import { httpConsoleLogger, fileLogger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(httpConsoleLogger);
app.use(fileLogger);
app.use(authenticator);
app.use("/", getRouter);
app.use("/", postRouter);

export default app;
