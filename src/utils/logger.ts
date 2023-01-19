const morgan = require("morgan");
import { createStream } from "rotating-file-stream";
import winston, { transports, format } from "winston";
import "winston-daily-rotate-file";

morgan.token("timestamp", () => `[${new Date().toLocaleString()}]`);

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
  ":timestamp :remote-addr :method :url :status :res[content-length] - :response-time ms :body",
  { stream: accessLogStream }
);

const httpConsoleLogger = morgan(":timestamp :remote-addr :method :url :status :res[content-length] - :response-time ms :body")


const logFormat = format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
const logger = winston.createLogger({
    level: 'info',
    format: format.combine(format.timestamp({format: new Date().toLocaleString()}), logFormat),
    defaultMeta: { service: 'user-service' },
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'DD-MM-YYYY',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]
});


export { logger, httpConsoleLogger, fileLogger };