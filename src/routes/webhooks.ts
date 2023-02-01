import { Router } from "express";
import Player from "../models/player";
const webhookRouter = Router();

import { isString } from "../utils/isString";
import { ENVIRONMENT } from "../utils/config";
import { logger } from "../utils/logger";

webhookRouter.post("/vote", async (req, res) => {
  const { user, type, isWeekend } = req.body;
  if (!isString(user) || !isString(type) || isWeekend === undefined)
    return res.status(400).json({ error: "Invalid request body" });

  const player = await Player.findOne({ discordId: user });
  if (!player) return res.status(404).json({ error: "Player not found" });

  if (type === "upvote") {
    player.unopenedCrates += isWeekend ? 2 : 1;
  } else if (type === "test" && ENVIRONMENT === "development") {
    player.unopenedCrates += isWeekend ? 2 : 1;
  } else return res.status(400).json({ error: "Invalid vote type" });

  logger.info(
    `Player ${player.discordId} has been given ${
      isWeekend ? 2 : 1
    } unopened crates for voting!`
  );

  try {
    await player.save();
    res.status(200).end();
  } catch (error) {
    logger.error(
      `Unknown error raised when trying to save player after vote webhook, error: ${error}`
    );
    res.status(500).end();
  }
});

export default webhookRouter;
