import { Router } from "express";

import items from "../items";
import Player, { Item } from "../models/player";

const router = Router();

router.post("/getShopForPlayer", async (req, res) => {
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

router.post("/initPlayer", async (req, res) => {
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

router.post("/buyItem", async (req, res) => {
  const { discordId, itemName, amount } = req.body;
  if (!discordId || !itemName)
    return res.status(400).send("discordId and itemName are required fields");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).send("Player not found");

  let item: Item | undefined;
  
  // if the item name is a number, it means the user wants to buy the item at that index + 1
  if(itemName.length <= 2 && Number(itemName)) {
    const index = Math.floor(Number(itemName)) - 1;
    item = items[index];
  } 
  else {
    item = items.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
  }


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

  const itemInInventory = player.inventory.find((i) => i.name === item?.name);

  const itemPriceBig = itemInInventory
    ? BigInt(item.price.toString()) *
      BigInt(itemInInventory.amount) *
      BigInt(amountToBuy)
    : BigInt(item.price.toString()) * BigInt(amountToBuy);

  if (newBalance >= itemPriceBig) {
    newBalance = newBalance - itemPriceBig;
    const newCps = player.cps + item.cps * amountToBuy;

    let inventory = player.inventory;

    if (itemInInventory) {
      itemInInventory.amount = itemInInventory.amount + amountToBuy;
      inventory = inventory.map((item) => {
        if (item.name === itemInInventory.name) {
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

    const purchasedItem = itemInInventory ? itemInInventory : { ...item, amount: amountToBuy }

    res.send({ player: updatedPlayer, purchasedItem });
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

router.post("/updatePlayer", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOne({ discordId });
  if (!player) return res.status(404).send("Player not found");

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );

  if (!secondsSinceLastUpdate) return res.send(player);

  const oldBalance = BigInt(player.balance as string)
  const cps = BigInt(player.cps);
  const updatedAt = player.updatedAt

  const newBalance = balanceUpdater({ oldBalance, cps, updatedAt })

  logger.info(
    `Updating player ${player.discordId}
    player.balance (old): ${player.balance}
    player.balance (new): ${newBalance}
    balance diff: ${BigInt(newBalance) - BigInt(player.balance as string)}
    secondsSinceLastUpdate: ${secondsSinceLastUpdate}
    player.cps:${player.cps}`
  );

  player.balance = newBalance.toString();

  const updatedPlayer = await player.save();

  res.send(updatedPlayer);
});

router.post("/addBitToPlayer", async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");
  
  const player = await Player.findOneAndUpdate({ discordId }, { $inc: { balance: 1}}, {timestamps: false});
  if (!player) return res.status(404).end();
  res.status(200).end();
});

router.get("/updateAllPlayers", async (_req, res) => {
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

export default router;