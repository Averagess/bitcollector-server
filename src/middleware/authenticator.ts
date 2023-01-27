import { Request, Response, NextFunction } from "express";

import config from "../utils/config";
const { ADMIN_TOKEN } = config

const keys = ["PwdkIEkslESQweFso1Odw3DxC22Ax4", ADMIN_TOKEN];

const authenticator = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const [type, key] = authorization.split(" ");

  if (type !== "Bearer") {
    return res.status(401).json({ error: "Unauthorized" }); 
  }

  if (!keys.includes(key)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export default authenticator;