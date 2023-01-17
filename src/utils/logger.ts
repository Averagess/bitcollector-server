import morgan from "morgan"

morgan.token("date", () => `[${new Date().toLocaleString()}]`)
morgan.token("body", (req:any) => {
  if(req.method === "GET") return ""
  else return JSON.stringify(req.body)
})

const logger = morgan(":date :remote-addr :method :url :status :res[content-length] - :response-time ms :body")

export default logger