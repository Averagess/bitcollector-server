import { NextFunction,  Response } from "express";

import getPlayerByID from "../datafetchers/getPlayerByID";
import { ExtendedRequest } from "../types";
import isString from "../utils/isString";
import { ADMIN_TOKEN } from "../utils/config";

const playerExtractor = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { discordId } = req.body;

  if(!isString(discordId)) return res.status(400).json({ error: "Missing or invalid discordId" });

  const player = await getPlayerByID(discordId);

  if(!player) return res.status(404).json({ error: "Player not found" });

  const [type, key] = req.headers.authorization.split(" ");
  if(player.blacklisted && (type === "Bearer" && key !== ADMIN_TOKEN)) return res.status(403).json({ error: "Player is blacklisted" });

  req.player = player;
  next();
};

export default playerExtractor;