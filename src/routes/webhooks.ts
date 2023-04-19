import { Router } from "express";
const webhookRouter = Router();

import getPlayerByID from "../datafetchers/getPlayerByID";
import updatePlayer from "../datafetchers/updatePlayer";
import { ENVIRONMENT } from "../utils/config";
import isString from "../utils/isString";
import { logger } from "../utils/logger";

const isWeekendValidValue = (value: unknown): boolean => {
  if (isString(value)) {
    if (value === "true" || value === "false") return true;
    else return false;
  } else if (typeof value === "boolean") return true;
  else return false;
};

webhookRouter.post("/topgg", async (req, res) => {
  const { user, type, isWeekend } = req.body;
  if (!isString(user) || !isString(type) || !isWeekendValidValue(isWeekend))
    return res.status(400).json({ error: "Invalid request body" });

  const player = await getPlayerByID(user);
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
    await updatePlayer(player, false);
    res.status(200).end();
  } catch (error) {
    logger.error(
      `Unknown error raised when trying to save player after vote webhook, error: ${error}`
    );
    res.status(500).end();
  }
});

webhookRouter.post("/discords", async (req,res) => {
  const { user, type } = req.body;
  if (!isString(user) || !isString(type)) return res.status(400).json({ error: "Invalid request body" });

  const player = await getPlayerByID(user);
  if (!player) return res.status(404).json({ error: "Player not found" });

  if(type === "vote"){
    player.unopenedCrates += 1;
  } else if(type === "test" && ENVIRONMENT === "development"){
    player.unopenedCrates += 1;
  } else return res.status(400).json({ error: "Invalid vote type" });

  logger.info(`Player ${player.discordId} has been given 1 unopened crate for voting!`);

  try {
    await updatePlayer(player, false);
    res.status(200).end();
  } catch (error) {
    logger.error(
      `Unknown error raised when trying to save player after vote webhook, error: ${error}`
    );
    res.status(500).end();
  }
});

webhookRouter.post("/discordbotlist", async (req,res) => {
  const { id } = req.body;
  if (!isString(id)) return res.status(400).json({ error: "Invalid request body" });

  const player = await getPlayerByID(id);
  if (!player) return res.status(404).json({ error: "Player not found" });

  player.unopenedCrates += 1;

  logger.info(`Player ${player.discordId} has been given 1 unopened crate for voting!`);

  try {
    await updatePlayer(player, false);
    res.status(200).end();
  } catch (error) {
    logger.error(
      `Unknown error raised when trying to save player after vote webhook, error: ${error}`
    );
    res.status(500).end();
  }
});

export default webhookRouter;
