import Player from "../models/player";
import { NextFunction,  Response } from "express";
import { ExtendedRequest } from "../types";

const isString = (value: unknown): value is string => {
  if(typeof value === "string" || value instanceof String) return true
  return false
}

const playerExtractor = async (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const { discordId } = req.body

  if(!discordId || !isString(discordId)) return res.status(400).json({ error: "Missing or invalid discordId" })

  const player = await Player.findOne({ discordId })
  if(!player) return res.status(404).json({ error: "Player not found" })

  if(player.blacklisted) return res.status(403).json({ error: "Player is blacklisted" }) // TODO: Add a reason (if black

  req.player = player
  next()
}

export default playerExtractor;