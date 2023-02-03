import { Router } from "express";
import { Player } from "../models";
const webhookRouter = Router();

import { isString } from "../utils/isString";
import { ENVIRONMENT } from "../utils/config";
import { logger } from "../utils/logger";

const parseIsWeekend = (value: unknown): boolean => {
  if (isString(value)) {
    if (value === "true") return true;
    else if (value === "false") return false;
    else throw new Error("Invalid value for isWeekend");
  } else if (typeof value === "boolean") return value;
  else throw new Error("Invalid value for isWeekend");
};

const isWeekendValueValid = (value: unknown): boolean => {
  try {
    parseIsWeekend(value);
    return true;
  } catch (error) {
    return false;
  }
};

webhookRouter.post("/vote", async (req, res) => {
  const { user, type, isWeekend } = req.body;
  if (!isString(user) || !isString(type) || !isWeekendValueValid(isWeekend))
    return res.status(400).json({ error: "Invalid request body" });

  const player = await Player.findOne({ discordId: user });
  if (!player) return res.status(404).json({ error: "Player not found" });

  const shouldRewardDouble: boolean = isString(isWeekend)
    ? isWeekend === "true"
    : isWeekend;

  if (type === "upvote") {
    player.unopenedCrates += shouldRewardDouble ? 2 : 1;
  } else if (type === "test" && ENVIRONMENT === "development") {
    player.unopenedCrates += shouldRewardDouble ? 2 : 1;
  } else return res.status(400).json({ error: "Invalid vote type" });

  logger.info(
    `Player ${player.discordId} has been given ${
      shouldRewardDouble ? 2 : 1
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
