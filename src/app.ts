import express, { NextFunction, Response, Request } from "express";
import authenticator from "./middleware/authenticator";

import getRouter from "./routes/getters";
import postRouter from "./routes/posters";

import { httpConsoleLogger, fileLogger, logger } from "./utils/logger";

const app = express();

// const blockOutsideConnections = (req: Request, res: Response, next: NextFunction) => {
//   if(req.ip !== "::ffff:127.0.0.1" && req.ip !== "::1") {
//     logger.info(`Blocked request from outside connection, ip: ${req.ip}`)
//     return res.status(403).json({error: "Forbidden"}).end()
//   }

//   next()
// }

app.use(express.json());
app.use(httpConsoleLogger);
app.use(fileLogger);
app.use(authenticator)

// app.use(blockOutsideConnections);

app.use("/", getRouter);
app.use("/", postRouter);

export default app;
