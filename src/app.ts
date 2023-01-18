const express = require("express");

import getRouter from "./routes/getters";
import postRouter from "./routes/posters";

import { consoleLogger, fileLogger } from "./utils/logger";

const app = express();

app.use(express.json());
app.use(consoleLogger);
app.use(fileLogger);

app.use("/", getRouter);
app.use("/", postRouter);

export default app;
