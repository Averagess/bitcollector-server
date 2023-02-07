import { Router } from "express";
import { logger } from "../utils/logger";

import getPlayerByID from "../datafetchers/getPlayerByID";
import updatePlayer from "../datafetchers/updatePlayer";
import balanceUpdater from "../helpers/balanceUpdater";
import randomItemDrop from "../helpers/randomItemDrop";
import items from "../items";
import playerExtractor from "../middleware/playerExtractor";
import { Player } from "../models";
import { ExtendedRequest, Item } from "../types";
import { isString } from "../utils/isString";

const router = Router();

router.post("/getShopForPlayer", playerExtractor, async (req:ExtendedRequest, res) => {
  const player = req.player;
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
  if (!req.body.discordId) return res.status(400).json({ error: "discordId is required" });
  if (!req.body.discordDisplayName)
    return res.status(400).json({ error: "discordDisplayName is required" });

  const player = new Player({
    discordId: req.body.discordId,
    discordDisplayName: req.body.discordDisplayName,
    balance: 0,
  });

  const existingPlayer = await Player.findOne({ discordId: player.discordId });
  if (existingPlayer) return res.status(409).json({ error: "Player already exists" });

  try {
    const savedPlayer = await player.save();
    res.send(savedPlayer);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.post("/buyItem", playerExtractor ,async (req:ExtendedRequest, res) => {
  const player = req.player;
  const { itemName, amount } = req.body;

  if (!itemName)
    return res.status(400).json({ error: "itemName is an required field" });



  let item: Item | undefined;

  // if the item name is a number, it means the user wants to buy the item at that index - 1
  if (itemName.length <= 2 && Number(itemName)) {
    const index = Math.floor(Number(itemName)) - 1;
    item = items[index];
  } else {
    item = items.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
  }

  if (!item) return res.status(404).send("No such item in the shop");

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );


  const oldBalance = BigInt(player.balance as string);
  const cps = player.cps;
  const updatedAt = new Date(player.updatedAt);

  let newBalance = balanceUpdater({ oldBalance, cps, updatedAt });


  logger.info(
    `Updating player ${player.discordId}
      player.balance (old): ${player.balance}
      player.balance (new): ${newBalance}
      balance diff: ${BigInt(newBalance) - BigInt(player.balance as string)}
      secondsSinceLastUpdate: ${secondsSinceLastUpdate}
      player.cps: ${player.cps}`
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

    const newCps = Math.round((player.cps + item.cps * amountToBuy) * 100) / 100;

    let inventory = player.inventory;

    if (itemInInventory) {
      itemInInventory.amount = itemInInventory.amount + amountToBuy;
      itemInInventory.price = itemInInventory.price + item.price * amountToBuy;
      itemInInventory.cps = (item.cps * itemInInventory.amount);
      inventory = inventory.map((item) => {
        if (item.name === itemInInventory.name) {
          return itemInInventory;
        }
        return item;
      });
    } else {
      inventory.push({ ...item, cps: item.cps * amountToBuy, amount: amountToBuy });
    }

    player.balance = newBalance.toString();
    player.cps = newCps;
    player.inventory = inventory;

    // const updatedPlayer = await player.save();
    updatePlayer(player, true);

    const purchasedItem = itemInInventory
      ? itemInInventory
      : { ...item, amount: amountToBuy };

    res.send({ player, purchasedItem });
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

router.post("/updatePlayer", playerExtractor,async (req: ExtendedRequest, res) => {
  const player = req.player;

  const discordName = isString(req.body.discordDisplayName) ? req.body.discordDisplayName : null;
  if(discordName && discordName !== player.discordDisplayName) player.discordDisplayName = discordName;

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );

  if (!secondsSinceLastUpdate) return res.send(player);

  const oldBalance = BigInt(player.balance as string);
  const cps = player.cps;
  const updatedAt = new Date(player.updatedAt);

  const newBalance = balanceUpdater({ oldBalance, cps, updatedAt });

  logger.info(
    `Updating player ${player.discordId}
    player.balance (old): ${player.balance}
    player.balance (new): ${newBalance}
    balance diff: ${BigInt(newBalance) - BigInt(player.balance as string)}
    secondsSinceLastUpdate: ${secondsSinceLastUpdate}
    player.cps:${player.cps}`
  );

  player.balance = newBalance.toString();

  // const updatedPlayer = await player.save();
  updatePlayer(player, true);

  res.send(player);
});

router.post("/updateTwoPlayers", async (req,res) => {
  const { targetId, clientId } = req.body;

  if(!isString(targetId) || !isString(clientId)) return res.status(400).json({ error: "either both or one of the ids are missing or incorrect type" });

  const client = await Player.findOne({ discordId: clientId });
  const target = await Player.findOne({ discordId: targetId });

  if(!client) return res.status(404).json({ error: "client not found" });
  if(!target) return res.status(404).json({ error: "target not found" });

  const clientOldBalance = BigInt(client.balance as string);
  const clientCps = client.cps;
  const clientUpdatedAt = new Date(client.updatedAt);
  const clientNewBalance = balanceUpdater({ oldBalance: clientOldBalance, cps: clientCps, updatedAt: clientUpdatedAt });

  const targetOldBalance = BigInt(target.balance as string);
  const targetCps = target.cps;
  const targetUpdatedAt = new Date(target.updatedAt);
  const targetNewBalance = balanceUpdater({ oldBalance: targetOldBalance, cps: targetCps, updatedAt: targetUpdatedAt });

  client.balance = clientNewBalance.toString();
  target.balance = targetNewBalance.toString();

  await Player.bulkSave([client, target]);

  res.json({ client, target });
});

router.post("/addBitToPlayer",async (req, res) => {

  const { discordId } = req.body;
  if (!discordId) return res.status(400).send("discordId is required");

  const player = await Player.findOneAndUpdate(
    { discordId },
    { $inc: { balance: 1 } },
    { timestamps: false }
  );
  if (!player) return res.status(404).end();
  res.status(200).end();
});

router.post("/resetPlayer", playerExtractor,async (req: ExtendedRequest, res) => {
  const player = req.player;

  player.balance = "0";
  player.cps = 0;
  player.inventory = [];

  // const updatedPlayer = await player.save();
  const updatedPlayer = await updatePlayer(player, true);
  return res.send(updatedPlayer);
});

router.post("/blacklistPlayer",async (req: ExtendedRequest,res) => {
  const { discordId, reason } = req.body;

  if(!isString(discordId)) return res.status(400).json({ error: "missing or invalid discordId" });

  // const player = await Player.findOne({ discordId });
  const player = await getPlayerByID(discordId);
  if(player.blacklisted) return res.status(409).json({ error: "player already blacklisted" });


  if(isString(reason)){
    player.blacklisted = { reason: reason, started: new Date() };
  } else {
    player.blacklisted = { reason: "Reason not given", started: new Date() };
  }

  try {
    // const savedPlayer = await player.save({ timestamps: false });
    const savedPlayer = await updatePlayer(player, false);
    res.send(savedPlayer);
  } catch (error) {
    res.status(500).end();
  }
});

router.post("/unblacklistPlayer",async (req: ExtendedRequest,res) => {
  const { discordId } = req.body;
  if(!isString(discordId)) return res.status(400).json({ error: "missing or invalid discordId" });
  // const player = await Player.findOne({ discordId });
  const player = await getPlayerByID(discordId);
  if(!player) return res.status(404).json({ error: "player not found" });
  if(player.blacklisted === null) return res.status(409).json({ error: "player not blacklisted" });


  player.blacklistHistory.push({
    reason: player.blacklisted.reason ? player.blacklisted.reason : "No reason given",
    started: player.blacklisted.started,
    ended: new Date(),
  });

  player.blacklisted = null;

  try {
    // const savedPlayer = await player.save();
    const savedPlayer = await updatePlayer(player, true);
    res.send(savedPlayer);
  } catch (error) {
    res.status(500).end();
  }
});

router.post("/redeemDaily", playerExtractor,async (req: ExtendedRequest, res) => {
  const player = req.player;
  // If this is falsy ( null ), its the first time the player has redeemed daily. Otherwise we create a new date object from the lastDaily property
  const hoursSinceLastRedeem = player.lastDaily ? Math.floor(Date.now() - new Date(player.lastDaily).getTime()) / 1000 / 60 / 60 : null;

  const resObject = {
    balanceReward: null,
  };

  if(hoursSinceLastRedeem < 24 && hoursSinceLastRedeem !== null) return res.status(409).json({ error: "daily already redeemed", hoursSinceLastRedeem });

  const oldBalance = BigInt(player.balance as string);
  const cps = player.cps;
  const updatedAt = new Date(player.updatedAt);
  const updatedBalance = balanceUpdater({ oldBalance, cps, updatedAt });


  player.dailyCount += 1;
  player.lastDaily = new Date();

  // default daily reward
  resObject.balanceReward = Math.floor(Math.random() * 500 + 1);

  // add the reward to the players balance
  player.balance = (updatedBalance + BigInt(resObject.balanceReward)).toString();

  // await player.save();
  updatePlayer(player, true);
  res.send(resObject);
});

router.post("/openCrate", playerExtractor, async (req: ExtendedRequest, res) => {
  const player = req.player;

  if(player.unopenedCrates <= 0) return res.status(409).json({ error: "no crates to open" });

  const resObject = {
    balanceReward: null,
    itemReward: { name: null, amount: null, cps: null, price: null },
  };

  const oldBalance = BigInt(player.balance as string);
  const cps = player.cps;
  const updatedAt = new Date(player.updatedAt);

  const balanceReward = Math.round(Math.random() * 1500);

  player.balance = (balanceUpdater({ oldBalance, cps, updatedAt }) + BigInt(balanceReward)).toString();
  resObject.balanceReward = balanceReward;

  player.unopenedCrates -= 1;
  player.openedCrates +=  1;

  const randomItem = randomItemDrop();
  const randomAmount = Math.round(Math.random() * 10);

  const itemInInventory = player.inventory.find(item => item.name === randomItem.name);

  resObject.itemReward = { ...randomItem, amount: randomAmount, cps: Math.round(randomItem.cps * randomAmount * 100) / 100 };

  if(itemInInventory) {
    itemInInventory.amount += randomAmount;
    itemInInventory.cps = Math.round(randomItem.cps * itemInInventory.amount * 100) / 100;
    player.inventory = player.inventory.map(item => item.name === randomItem.name ? itemInInventory : item);
  } else {
    player.inventory.push({ ...randomItem, amount: randomAmount, cps: Math.round(randomItem.cps * randomAmount * 100) / 100 });
  }

  const newCps = player.inventory.reduce((acc, item) => acc + item.cps, 0);
  player.cps = Math.round(newCps * 100) / 100;

  // await player.save();
  await updatePlayer(player, true);
  res.send(resObject);
});

export default router;
