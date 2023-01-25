import { logger } from "../utils/logger";
import { Router } from "express";

import items from "../items";
import Player, { Item } from "../models/player";
import balanceUpdater from "../helpers/balanceUpdater";
import playerExtractor from "../middleware/playerExtractor";
import { ExtendedRequest } from "../types";
import randomItemDrop from "../helpers/randomItemDrop";

const router = Router();

router.post("/getShopForPlayer", playerExtractor, async (req:ExtendedRequest, res) => {
  const player = req.player 
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
  if (!req.body.discordId) return res.status(400).json({error: "discordId is required"});
  if (!req.body.discordDisplayName)
    return res.status(400).json({error: "discordDisplayName is required"});

  const player = new Player({
    discordId: req.body.discordId,
    discordDisplayName: req.body.discordDisplayName,
    balance: 0,
  });

  const existingPlayer = await Player.findOne({ discordId: player.discordId });
  if (existingPlayer) return res.status(409).json({error: "Player already exists"});

  try {
    const savedPlayer = await player.save();
    res.send(savedPlayer);
  } catch (error) {
    logger.error(error);
    res.status(500).end();
  }
});

router.post("/buyItem", playerExtractor ,async (req:ExtendedRequest, res) => {
  const player = req.player
  const { itemName, amount } = req.body;

  if (!itemName)
    return res.status(400).json({error: "itemName is an required field"});



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

  let newBalance = balanceUpdater({ oldBalance, cps, updatedAt })


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
      itemInInventory.cps = (item.cps * itemInInventory.amount)
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

    const updatedPlayer = await player.save();

    const purchasedItem = itemInInventory
      ? itemInInventory
      : { ...item, amount: amountToBuy };

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

router.post("/updatePlayer", playerExtractor,async (req: ExtendedRequest, res) => {
  const player = req.player

  const secondsSinceLastUpdate = Math.floor(
    (Date.now() - new Date(player.updatedAt).getTime()) / 1000
  );

  if (!secondsSinceLastUpdate) return res.send(player);

  const oldBalance = BigInt(player.balance as string)
  const cps = player.cps;
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
  const player = req.player

  player.balance = "0";
  player.cps = 0;
  player.inventory = [];

  const updatedPlayer = await player.save();
  return res.send(updatedPlayer);
});

router.post("/blacklistPlayer", playerExtractor,async (req: ExtendedRequest,res) => {
  const player = req.player
  const { reason } = req.body;

  if(player.blacklisted) return res.status(409).json({ error: "player already blacklisted"})


  if(reason && (reason instanceof String || typeof reason === "string")){
    player.blacklisted = { reason: reason.toString(), started: new Date() }
  } else {
    player.blacklisted = { reason: "Reason not given", started: new Date() }
  }

  try {
    const savedPlayer = await player.save()
    res.send(savedPlayer)
  } catch (error) {
    res.status(500).end()
  }
})

router.post("/unblacklistPlayer", playerExtractor,async (req: ExtendedRequest,res) => {
  const player = req.player
  if(!player.blacklisted) return res.status(409).json({ error: "player not blacklisted"})

  
  player.blacklistHistory.push({
    reason: player.blacklisted.reason ? player.blacklisted.reason : "No reason given",
    started: player.blacklisted.started,
    ended: new Date(),
  })

  player.blacklisted = null;

  try {
    const savedPlayer = await player.save()
    res.send(savedPlayer)
  } catch (error) {
    res.status(500).end()
  }
})

router.post("/redeemDaily", playerExtractor,async (req: ExtendedRequest, res) => {
  const player = req.player
  // If this is falsy ( null ), its the first time the player has redeemed daily. Otherwise we create a new date object from the lastDaily property
  const hoursSinceLastRedeem = player.lastDaily ? Math.floor(Date.now() - new Date(player.lastDaily).getTime()) / 1000 / 60 / 60 : null

  const resObject = {
    balanceReward: null,
    itemReward: {name: null, amount: null, cps: null},
  }

  if(hoursSinceLastRedeem < 24 && hoursSinceLastRedeem !== null) return res.status(409).json({ error: "daily already redeemed", hoursSinceLastRedeem });
  
  const oldBalance = BigInt(player.balance as string)
  const cps = player.cps;
  const updatedAt = player.updatedAt
  player.balance = balanceUpdater({ oldBalance, cps, updatedAt }).toString()
  

  player.dailyCount += 1
  player.lastDaily = new Date()

  // default daily reward
  resObject.balanceReward = 100

  // add 100 to the players balance
  player.balance = (BigInt(player.balance as string) + BigInt(100)).toString()

  // 50 50 chance
  const shouldGiveItem = Math.round(Math.random()) === 1

  if(shouldGiveItem && player.inventory.length > 0){

    // get the random item from the players inventory
    const randomItem = player.inventory[Math.floor(Math.random() * player.inventory.length)]
    const itemInShop = items.find(item => item.name === randomItem.name)

    let randomAmount = Math.round(Math.random() * 10)
    if(!randomAmount) randomAmount = 1;

    randomItem.amount += randomAmount
    
    // Round the cps 2 decimals
    randomItem.cps = Math.round(itemInShop.cps * randomItem.amount * 100) / 100

    const newCps = player.inventory.reduce((acc, item) => acc + item.cps, 0)

    player.cps = Math.round(newCps * 100) / 100

    resObject.itemReward.name = randomItem.name
    resObject.itemReward.amount = randomAmount
    resObject.itemReward.cps = Math.round(itemInShop.cps * randomAmount*100) / 100
  }

  await player.save()
  res.send(resObject)
})

router.post("/openCrate", playerExtractor, async (req: ExtendedRequest, res) => {
  const player = req.player

  if(player.unopenedCrates <= 0) return res.status(409).json({ error: "no crates to open"})

  const resObject = {
    balanceReward: null,
    itemReward: {name: null, amount: null, cps: null, price: null},
  }

  const oldBalance = BigInt(player.balance as string)
  const cps = player.cps
  const updatedAt = player.updatedAt

  const balanceReward = Math.round(Math.random() * 1500)

  player.balance = (balanceUpdater({ oldBalance, cps, updatedAt}) + BigInt(balanceReward)).toString()
  resObject.balanceReward = balanceReward

  player.unopenedCrates -= 1
  player.openedCrates +=  1

  const randomItem = randomItemDrop()
  const randomAmount = Math.round(Math.random() * 10)

  const itemInInventory = player.inventory.find(item => item.name === randomItem.name)

  resObject.itemReward = {...randomItem, amount: randomAmount, cps: Math.round(randomItem.cps * randomAmount * 100) / 100}

  if(itemInInventory) {
    itemInInventory.amount += randomAmount
    itemInInventory.cps = Math.round(randomItem.cps * itemInInventory.amount * 100) / 100
    player.inventory = player.inventory.map(item => item.name === randomItem.name ? itemInInventory : item)
  } else {
    player.inventory.push({...randomItem, amount: randomAmount, cps: Math.round(randomItem.cps * randomAmount * 100) / 100})
  }

  const newCps = player.inventory.reduce((acc, item) => acc + item.cps, 0)
  player.cps = Math.round(newCps * 100) / 100

  await player.save()
  res.send(resObject)
})

export default router;
