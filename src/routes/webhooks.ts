import { Router } from "express";
import Player from "../models/player";
const webhookRouter = Router();

import { isString } from "../utils/isString";
import config from "../utils/config";
const { ENVIRONMENT } = config

webhookRouter.post("/vote", async (req,res) => {
  const { user, type, isWeekend } = req.body;
  if(!isString(user) || !isString(type) || isWeekend === undefined) return(res.status(400).json({ error: "Invalid request body" }));

  const player = await Player.findOne({ discordId: user });
  if(!player) return res.status(404).json({ error: "Player not found" });


  if(type === "upvote") {
    player.unopenedCrates += isWeekend ? 2 : 1
  } else if(type==="test" && ENVIRONMENT === "development") {
    player.unopenedCrates += isWeekend ? 2 : 1
  }

  await player.save();
  res.status(200)
})

export default webhookRouter;