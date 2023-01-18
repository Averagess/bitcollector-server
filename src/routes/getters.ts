import { Router } from "express";
const cron = require("node-cron")

import items from "../items";
import Player from "../models/player";

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
  console.log("Updating leaderboard");
  const players = await Player.find({});
  const playersWithUpdatedBalance = players.map((player) => {
    const secondsSinceLastUpdate = Math.floor(
      (Date.now() - new Date(player.updatedAt).getTime()) / 1000
    );
    let newBalance =
      BigInt(player.balance as string) +
      BigInt(player.cps) * BigInt(secondsSinceLastUpdate);
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
  leaderBoard.nextUpdate = new Date(Date.now() + 1000 * 60 * 30);
  console.log("Leaderboard updated");
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

if(process.env.NODE_ENV !== "test"){
  cron.schedule("*/30 * * * *", updateLeaderboard)
}

export default router;
