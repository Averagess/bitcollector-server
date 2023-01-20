import { logger } from "../utils/logger";
import { Router } from "express";
const cron = require("node-cron");

import items from "../items";
import Player from "../models/player";
import balanceUpdater from "../helpers/balanceUpdater";
import player from "../models/player";

const router = Router();

interface PlayerInLeaderboard {
  discordDisplayName: string;
  discordId: string;
  cps: number;
  balance: string;
}

interface leaderboard {
  players: PlayerInLeaderboard[] | null;
  createdAt: Date | null;
  nextUpdate: Date | null;
}

const leaderBoard: leaderboard = {
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

    const newBalance = balanceUpdater({ oldBalance, cps, updatedAt });

    return {
      discordDisplayName: player.discordDisplayName,
      discordId: player.discordId,
      cps: player.cps,
      balance: newBalance.toString(),
    };
  });

  const sortedPlayers = playersWithUpdatedBalance.sort(
    (a, b) => Number(b.balance) - Number(a.balance)
  );

  leaderBoard.players = sortedPlayers.splice(0, 10);
  leaderBoard.createdAt = new Date();

  const nextUpdate = new Date();
  const currentMinutes = nextUpdate.getMinutes();
  const next30or00minute =
    currentMinutes + 30 >= 60 && currentMinutes !== 60
      ? 0
      : 30; /* Basically this is either 00 (like 1:00) OR  30 (like 1:30) depending which time we are closer to at the execution time */
  
  const nextHourOrCurrentHour = next30or00minute === 0 ? nextUpdate.getHours() + 1 : nextUpdate.getHours();
  
  nextUpdate.setHours(nextHourOrCurrentHour);
  nextUpdate.setMinutes(next30or00minute);

  leaderBoard.nextUpdate = nextUpdate;
  logger.info(`Leaderboard updated successfully, next update is ${nextUpdate.toLocaleString() }`);
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
  const players = await player.find()
  
  const blacklistedPlayers = players.filter(player => player.blacklisted)
  res.send(blacklistedPlayers)
})

if (process.env.NODE_ENV !== "test") {
  cron.schedule("*/30 * * * *", updateLeaderboard);
}

export default router;
