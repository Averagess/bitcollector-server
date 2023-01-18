const morgan = require("morgan");
import { createStream } from "rotating-file-stream";

morgan.token("timestamp", () => `[${new Date().toLocaleString()}]`);

morgan.token("body", (req: any) => {
  if (req.method === "GET") return "";
  else return JSON.stringify(req.body);
});

const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: "logs",
  compress: "gzip",
});

const fileLogger = morgan(
  ":timestamp :remote-addr :method :url :status :res[content-length] - :response-time ms :body",
  { stream: accessLogStream }
);

const consoleLogger = morgan(":date :remote-addr :method :url :status :res[content-length] - :response-time ms :body")

export { consoleLogger, fileLogger };