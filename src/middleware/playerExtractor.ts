import Player from "../models/Player";
import { NextFunction,  Response } from "express";
import { ExtendedRequest } from "../types";
import { isString } from "../utils/isString";

const playerExtractor = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { discordId } = req.body

  if(!isString(discordId)) return res.status(400).json({ error: "Missing or invalid discordId" })

  const player = await Player.findOne({ discordId })
  if(!player) return res.status(404).json({ error: "Player not found" })

  if(player.blacklisted) return res.status(403).json({ error: "Player is blacklisted" })

  req.player = player
  next()
}

export default playerExtractor;