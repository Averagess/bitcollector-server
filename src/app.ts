import express, { NextFunction, Response, Request } from "express";

import getRouter from "./routes/getters";
import postRouter from "./routes/posters";

import { httpConsoleLogger, fileLogger } from "./utils/logger";

const app = express();

const blockOutsideConnections = (req: Request, res: Response, next: NextFunction) => {
  if(req.ip !== "::ffff:127.0.0.1") return res.status(403).json({error: "Forbidden"}).end()

  next()
}

app.use(express.json());
app.use(httpConsoleLogger);
app.use(fileLogger);

app.use(blockOutsideConnections);

app.use("/", getRouter);
app.use("/", postRouter);

export default app;
