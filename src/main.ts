import express from "express";
import { consoleLogger, fileLogger } from "./utils/logger";

import Player from "./models/player";

const app = express();

app.use(express.json());
app.use(consoleLogger);
app.use(fileLogger);

import config from "./utils/config";
import { connectToDatabase } from "./utils/db";
import items from "./items";
const PORT = config.PORT;

connectToDatabase();

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.post("/", (req, res) => {
  res.send(req.body);
});

app.get("/allPlayers", async (_req, res) => {
  const players = await Player.find({});
  res.send(players);
});

app.get("/allItems", (_req, res) => {
  res.send(items);
});

// OPTIMIZATION: Setup an cron job to run every x hours that updates the leaderboard.
app.get("/leaderboard", async (_req, res) => {
  const players = await Player.find({});
  const playersWithUpdatedBalance = players.map((player) => {
    const secondsSinceLastUpdate = Math.floor(
      (Date.now() - new Date(player.updatedAt).getTime()) / 1000
    );
    let newBalance =
      BigInt(player.balance as string) +
      BigInt(player.cps) * BigInt(secondsSinceLastUpdate);
    return {
      ...player.toObject(),
      balance: newBalance.toString(),
    };
  });

  const sortedPlayers = playersWithUpdatedBalance.sort(
    (a, b) => Number(b.balance) - Number(a.balance)
  );

  return res.send(sortedPlayers);
});

app.post("/getShopForPlayer", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).send("Player not found");
  const inventory = player.inventory;

  const shop = items.map((item) => {
    const playerItem = inventory.find((i) => i.name === item.name);
    if (playerItem) {
      return {
        ...item,
        amount: playerItem.amount,
        price: item.price * playerItem.amount,
      };
    } else {
      return { ...item, amount: 0 };
    }
  });

  res.send(shop);
});

app.post("/initPlayer", async (req, res) => {
  if (!req.body.discordId) return res.status(400).send("discordId is required");
  if (!req.body.discordDisplayName)
    return res.status(400).send("discordDisplayName is required");

  const player = new Player({
    discordId: req.body.discordId,
    discordDisplayName: req.body.discordDisplayName,
    balance: 0,
  });

  const existingPlayer = await Player.findOne({ discordId: player.discordId });
  if (existingPlayer) return res.status(409).send("Player already exists");

  try {
    const savedPlayer = await player.save();
    res.send(savedPlayer);
  } catch (error) {
    res.status(500).end();
  }
});

app.post("/checkBalance", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(400).send("Player not found");

  res.send({ balance: player.balance.toString() });
});

app.post("/buyItem", async (req, res) => {
  const { discordId, itemName, amount } = req.body;
  if (!discordId || !itemName)
    return res.status(400).send("discordId and itemName are required fields");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).send("Player not found");

  const item = items.find(
    (item) => item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (!item) return res.status(404).send("No such item in the shop");

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );

  let newBalance =
    BigInt(player.balance as string) +
    BigInt(player.cps) * BigInt(secondsSinceLastUpdate);

  console.log(
    `player.balance (old): ${player.balance}`,
    `player.balance (new): ${newBalance}`,
    "secondsSinceLastUpdate: ",
    secondsSinceLastUpdate,
    "player.cps: ",
    player.cps
  );

  const amountToBuy = Number(amount) || 1;

  const itemInInventory = player.inventory.find((i) => i.name === item.name);

  const itemPriceBig = itemInInventory
    ? BigInt(item.price.toString()) *
      BigInt(itemInInventory.amount) *
      BigInt(amountToBuy)
    : BigInt(item.price.toString()) * BigInt(amountToBuy);

  console.log("itemPriceBig: ", itemPriceBig);

  if (newBalance >= itemPriceBig) {
    newBalance = newBalance - itemPriceBig;
    const newCps = player.cps + item.cps * amountToBuy;

    let inventory = player.inventory;

    if (itemInInventory) {
      itemInInventory.amount = itemInInventory.amount + amountToBuy;
      inventory = inventory.map((item) => {
        if (item.name === itemInInventory.name) {
          console.log(item);
          return itemInInventory;
        }
        return item;
      });
    } else {
      inventory.push({ ...item, amount: amountToBuy });
    }

    player.balance = newBalance.toString();
    player.cps = newCps;
    player.inventory = inventory;

    const updatedPlayer = await player.save();

    res.send(updatedPlayer);
  } else {
    const error = {
      error: "not enough money",
      itemPrice: itemPriceBig.toString(),
      balance: newBalance.toString(),
      itemName: item.name,
      amount: amountToBuy.toString(),
    };
    res.status(400).send(error);
  }
});

app.post("/updatePlayer", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).send("Player not found");

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );

  if (!secondsSinceLastUpdate) return res.send(player);

  const newBalance = (
    BigInt(player.balance as string) +
    BigInt(player.cps) * BigInt(secondsSinceLastUpdate)
  ).toString();

  console.log(
    `player.balance: ${player.balance}`,
    `new balance: ${newBalance}`,
    `diff balance: ${BigInt(newBalance) - BigInt(player.balance as string)}`,
    `secondsSinceLastUpdate: ${secondsSinceLastUpdate}`,
    `player.cps: ${player.cps}`
  );

  player.balance = newBalance;

  const updatedPlayer = await player.save();

  res.send(updatedPlayer);
});

app.get("/updateAllPlayers", async (req, res) => {
  const players = await Player.find();
  if (!players) return res.status(404).send("No players found");

  const updatedPlayers = await Promise.all(
    players.map(async (player) => {
      const secondsSinceLastUpdate = Math.floor(
        (Date.now() - new Date(player.updatedAt).getTime()) / 1000
      );

      if (!secondsSinceLastUpdate) return player;

      const newBalance = (
        BigInt(player.balance as string) +
        BigInt(player.cps) * BigInt(secondsSinceLastUpdate)
      ).toString();

      console.log(
        `player.balance: ${player.balance}`,
        `new balance: ${newBalance}`,
        `diff balance: ${
          BigInt(newBalance) - BigInt(player.balance as string)
        }`,
        `secondsSinceLastUpdate: ${secondsSinceLastUpdate}`,
        `player.cps: ${player.cps}`
      );

      player.balance = newBalance;

      console.log(
        `Updating player: ${player.discordId} | ${player.discordDisplayName} with new balance: ${newBalance}`
      );
      const updatedPlayer = await player.save();
      console.log(
        `Updated player: ${updatedPlayer.discordId} | ${updatedPlayer.discordDisplayName} successfully`
      );
      if (!updatedPlayer) return res.status(500).send("Something went wrong");

      return updatedPlayer;
    })
  );
  res.send(updatedPlayers);
});

app.post("/addBitToPlayer", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).end();
  const newBalance = (BigInt(player.balance as string) + BigInt(1)).toString();
  player.balance = newBalance;
  await player.save();
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log("Server listening on http://localhost:3000");
});
