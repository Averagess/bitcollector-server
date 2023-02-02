/* eslint-disable @typescript-eslint/no-explicit-any */
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import winston, { transports, format } from "winston";
import "winston-daily-rotate-file";

morgan.token("timestamp", () => `[${new Date().toLocaleString("fi-FI")}]`);
morgan.token("authKey", (req: any) => {
  if (req.headers.authorization) {
    const [type, key] = req.headers.authorization.split(" ");
    return `[${type}, ${key}]`;
  } else return "[no key]";
});

morgan.token("body", (req: any) => {
  if (req.method === "GET") return "";
  else return JSON.stringify(req.body);
});

const accessLogStream = createStream("access.log", {
  interval: "3d",
  path: "logs",
  compress: "gzip",
});

const fileLogger = morgan(
  ":timestamp :remote-addr :authKey :method :url :status :res[content-length] - :response-time ms :body",
  { stream: accessLogStream }
);

const httpConsoleLogger = morgan(":timestamp :remote-addr :authKey :method :url :status :res[content-length] - :response-time ms :body");


const logFormat = format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`);
const logger = winston.createLogger({
  level: "info",
  format: format.combine(format.timestamp({ format: "DD.MM.YYYY HH.mm.ss" }), logFormat),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: "logs/%DATE%.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d"
    })
  ]
});


export { logger, httpConsoleLogger, fileLogger };