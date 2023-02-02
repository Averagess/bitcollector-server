import { Request, Response, NextFunction } from "express";

import { ADMIN_TOKEN, BOT_TOKEN } from "../utils/config";

const keys = [BOT_TOKEN, ADMIN_TOKEN];

const authenticator = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [type, key] = authorization.split(" ");

  if (type !== "Bearer" || !keys.includes(key)) {
    return res.status(401).json({ error: "Unauthorized" });
  }


  next();
};

export default authenticator;