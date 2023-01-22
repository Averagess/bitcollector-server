import { Request, Response, NextFunction } from "express";

const keys = ["PwdkIEkslESQweFso1Odw3DxC22Ax4"];

const authenticator = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const [type, key] = authorization.split(" ");

  if (type !== "Bearer") {
    return res.status(401).json({ error: "Invalid authorization type" }); 
  }

  if (!keys.includes(key)) {
    return res.status(401).json({ error: "Invalid authorization key" });
  }

  next();
};

export default authenticator;