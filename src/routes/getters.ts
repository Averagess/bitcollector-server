import { Router } from "express";
import cron from "node-cron";

import balanceUpdater from "../helpers/balanceUpdater";
import items from "../items";
import Player from "../models/player";
import { logger } from "../utils/logger";

import { LeaderboardObject } from "../types";

const router = Router();

const leaderBoard: LeaderboardObject = {
  players: null,
  createdAt: null,
  nextUpdate: null,
};

const updateLeaderboard = async () => {
  logger.info("Updating leaderboard");
  const players = await Player.find({});

  const playersWithUpdatedBalance = players.map((player) => {
    const oldBalance = BigInt(player.balance as string);
    const cps = player.cps;
    const updatedAt = player.updatedAt;

    const newBalance = balanceUpdater({ oldBalance, cps, updatedAt }).toString();

    const { discordDisplayName, discordId } = player;

    return {
      discordDisplayName,
      discordId,
      cps, 
      balance: newBalance
    };
  }).sort((a,b) => {
    const aBalance = BigInt(a.balance)
    const bBalance = BigInt(b.balance)

    if(aBalance > bBalance) return -1
    else if(aBalance < bBalance) return 1
    else return 0
  })

  leaderBoard.players = playersWithUpdatedBalance.splice(0, 10);
  leaderBoard.createdAt = new Date();

  const nextUpdate = new Date();
  const currentMinutes = nextUpdate.getMinutes();
  const next30or00minute =
    currentMinutes + 30 >= 60 && currentMinutes !== 60
      ? 0
      : 30; /* Basically this is either 00 (like 1:00) OR  30 (like 1:30) depending which time we are closer to at the execution time */

  const nextHourOrCurrentHour =
    next30or00minute === 0 ? nextUpdate.getHours() + 1 : nextUpdate.getHours();

  nextUpdate.setHours(nextHourOrCurrentHour);
  nextUpdate.setMinutes(next30or00minute);

  leaderBoard.nextUpdate = nextUpdate;
  logger.info(
    `Leaderboard updated successfully, next update is ${nextUpdate.toLocaleString(
      "fi-FI"
    )}`
  );
};

router.get("/allPlayers", async (_req, res) => {
  const players = await Player.find({});
  res.send(players);
});

router.get("/allItems", (_req, res) => {
  res.send(items);
});

router.get("/leaderboard", async (_req, res) => {
  if (!leaderBoard.players) {
    await updateLeaderboard();
    return res.send(leaderBoard);
  }
  res.send(leaderBoard);
});

router.get("/blacklist", async (_req, res) => {
  const players = await Player.find();

  const blacklistedPlayers = players.filter((player) => player.blacklisted);
  res.send(blacklistedPlayers);
});

if (process.env.NODE_ENV !== "test") {
  cron.schedule("*/30 * * * *", updateLeaderboard);
}

router.get("/updateAllPlayers", async (_req, res) => {
  const players = await Player.find();
  if (!players) return res.status(404).send("No players found");

  const updatedPlayers = await Promise.all(
    players.map(async (player) => {
      const secondsSinceLastUpdate = Math.floor(
        (Date.now() - new Date(player.updatedAt).getTime()) / 1000
      );

      if (!secondsSinceLastUpdate) return player;

      const oldBalance = BigInt(player.balance as string);
      const cps = player.cps;
      const updatedAt = player.updatedAt;

      const newBalance = balanceUpdater({ oldBalance, cps, updatedAt });

      logger.info(`Updating player ${player.discordId}
      player.balance (old): ${player.balance}
      player.balance (new): ${newBalance}
      balance diff: ${BigInt(newBalance) - BigInt(player.balance as string)}
      secondsSinceLastUpdate: ${secondsSinceLastUpdate}
      player.cps: ${player.cps}`);

      player.balance = newBalance.toString();

      logger.info(
        `Updating player: ${player.discordId} | ${player.discordDisplayName} with new balance: ${newBalance}`
      );
      const updatedPlayer = await player.save();
      logger.info(
        `Updated player: ${updatedPlayer.discordId} | ${updatedPlayer.discordDisplayName} successfully`
      );
      if (!updatedPlayer) return res.status(500).send("Something went wrong");

      return updatedPlayer;
    })
  );
  res.send(updatedPlayers);
});

export default router;
