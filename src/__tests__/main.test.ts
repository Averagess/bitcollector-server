import app from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../utils/db";
import { BOT_TOKEN } from "../utils/config";
import supertest from "supertest";
import { Player } from "../models";
import balanceUpdater from "../helpers/balanceUpdater";
import { connectToCache, disconnectFromCache, client } from "../utils/redis";

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabase();
  await connectToCache();
  await client.flushAll();
  await Player.deleteMany({});
  await Player.create({
    discordId: "123",
    discordDisplayName: "test",
    balance: "0",
    cps: 5,
    inventory: [],
    unopenedCrates: 0,
    openedCrates: 0,
    lastDaily: null,
    dailyCount: 0,
    blacklisted: null,
    blacklistHistory: [],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  });
});

describe("test GET methods", () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BOT_TOKEN}`,
  };
  describe("GET /allPlayers", () => {
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.get("/api/allPlayers");
      expect(response.status).toBe(401);
    });
    test("should respond with 200 when token is provided", async () => {
      const response = await api.get("/api/allPlayers").set(headers);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /allItems", () => {
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.get("/api/allItems");
      expect(response.status).toBe(401);
    });
    test("should respond with 200 when token is provided", async () => {
      const response = await api.get("/api/allItems").set(headers);
      expect(response.status).toBe(200);
    });
  });

  describe("GET /leaderboard", () => {
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.get("/api/leaderboard");
      expect(response.status).toBe(401);
    });
    test("should respond with 200 and correct properties when token is provided", async () => {
      const response = await api.get("/api/leaderboard").set(headers);
      expect(response.status).toBe(200);
      expect(typeof response.body.bufferB64).toEqual("string");
    });
  });

  describe("GET /blacklist", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "TESTING-GET-/blacklist",
        discordDisplayName: "testintehee",
        balance: "0",
        cps: 0,
      });
    });
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.get("/api/blacklist");
      expect(response.status).toBe(401);
    });
    test("should respond with 200 and correct properties when token is provided", async () => {
      const response = await api.get("/api/blacklist").set(headers);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
    test("after adding a player to the blacklist, should respond with 200 and correct properties when token is provided", async () => {
      const player = await Player.findOne({
        discordId: "TESTING-GET-/blacklist",
      });
      if (player) player.blacklisted = { reason: "test", started: new Date() };
      await player?.save({ timestamps: false });
      const response = await api.get("/api/blacklist").set(headers);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
    });
  });
});
describe("test POST methods", () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BOT_TOKEN}`,
  };
  const body = {
    discordId: "123",
  };
  beforeAll(async () => {
    const player = await Player.findOne({ discordId: "123" });
    if (player) player.blacklisted = null;
    await player?.save({ timestamps: false });
  });
  describe("POST /getShopForPlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "TESTING-POST-/getShopForPlayer",
        discordDisplayName: "ok",
        balance: "0",
        cps: 0,
      });
    });
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/getShopForPlayer");
      expect(response.status).toBe(401);
    });
    test("should respond with 200 and correct properties when token is provided", async () => {
      const response = await api
        .post("/api/getShopForPlayer")
        .set(headers)
        .send({ discordId: "TESTING-POST-/getShopForPlayer" });
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });
  describe("POST /initPlayer", () => {
    beforeAll(async () => {
      await api.post("/api/initPlayer").set(headers).send(body);
    });
    test("should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/initPlayer");
      expect(response.status).toBe(401);
    });

    test("should respond with 200 and correct properties when token is provided", async () => {
      const newPlayerBody = { discordId: "456", discordDisplayName: "test" };
      const response = await api
        .post("/api/initPlayer")
        .set(headers)
        .send(newPlayerBody);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("cps");
      expect(response.body).toHaveProperty("inventory");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
    });

    test("should respond with 409 when we try to create a player that already exists", async () => {
      const response = await api
        .post("/api/initPlayer")
        .set(headers)
        .send({ discordId: "456", discordDisplayName: "test" });
      expect(response.status).toBe(409);
    });
  });

  describe("POST /buyItem", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "imPoor",
        discordDisplayName: "imPoor",
        balance: 0,
        cps: 0,
      });
      await Player.create({
        discordId: "imRich",
        discordDisplayName: "imRich",
        balance: 15000,
        cps: 0,
      });
      await Player.create({
        discordId: "iBuyMax",
        discordDisplayName: "iBuyMax",
        balance: 1000,
        cps: 0,
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/buyItem");
      expect(response.status).toBe(401);
    });
    test("Should respond with 200 and correct properties when token is provided", async () => {
      const response = await api
        .post("/api/buyItem")
        .set(headers)
        .send({ discordId: "imRich", itemName: "1" });
      expect(response.status).toBe(200);
      expect(response.body.player).toHaveProperty("discordId");
      expect(response.body.player).toHaveProperty("discordDisplayName");
      expect(response.body.player).toHaveProperty("balance");
      expect(response.body.player).toHaveProperty("cps");
      expect(response.body.player).toHaveProperty("inventory");
      expect(response.body.player).toHaveProperty("createdAt");
      expect(response.body.player).toHaveProperty("updatedAt");
      expect(response.body.player.inventory).toBeInstanceOf(Array);
      expect(response.body.player.inventory.length).toBe(1);
    });
    test("Should respond with 404 if we try to buy an nonexisting item", async () => {
      const response = await api
        .post("/api/buyItem")
        .set(headers)
        .send({ discordId: "imRich", itemName: "9This9Doesnt9Exist" });
      expect(response.status).toBe(404);
    });
    test("Should return with 400 if we dont have money to buy an item", async () => {
      const response = await api
        .post("/api/buyItem")
        .set(headers)
        .send({ discordId: "imPoor", itemName: "1" });
      expect(response.status).toBe(400);
    });
    test("Should return with 200 if we try to buy a max amount of an item, and return 20 bought items with balance 1k", async () => {
      const response = await api
        .post("/api/buyItem")
        .set(headers)
        .send({ discordId: "iBuyMax", itemName: "1", max: true });

      expect(response.status).toBe(200);
      expect(response.body.player.balance).toBe("0");
      expect(response.body.player.inventory[0].amount).toBe(20);
      expect(response.body.purchasedItem.amount).toBe(20);
      expect(response.body.purchasedItem.price).toBe("1000");
    });
    test("Should return with 400 if we try to buy a max amount of an item, with 0 balance", async () => {
      const response = await api
        .post("/api/buyItem")
        .set(headers)
        .send({ discordId: "iBuyMax", itemName: "1", max: true });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("not enough money");
      expect(response.body.itemPrice).toBe("1000");
      expect(response.body.amount).toBe("1");
    });
  });

  describe("POST /updatePlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "789",
        discordDisplayName: "testing updatePlayer",
        balance: 0,
        cps: 15,
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/updatePlayer");
      expect(response.status).toBe(401);
    });

    test("should respond with 200 and updates balance correctly", async () => {
      const response = await api
        .post("/api/updatePlayer")
        .set(headers)
        .send({ discordId: "789" });
      const correctAnswer = balanceUpdater({
        oldBalance: 0n,
        cps: 15,
        updatedAt: new Date("12.11.2022"),
      }).toString();
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("cps");
      expect(response.body.balance.substring(0, 4)).toBe(
        correctAnswer.substring(0, 4)
      );
    });

    test("should respond with 404 if we try to update a nonexisting player", async () => {
      const response = await api
        .post("/api/updatePlayer")
        .set(headers)
        .send({ discordId: "999" });
      expect(response.status).toBe(404);
    });
  });

  describe("POST /updateTwoPlayers", () => {
    beforeAll(async () => {
      const player1 = new Player({
        discordId: "111",
        discordDisplayName: "testing updateTwoPlayers",
        balance: 0,
        cps: 123,
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
      const player2 = new Player({
        discordId: "222",
        discordDisplayName: "testing updateTwoPlayers",
        balance: 0,
        cps: 321,
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
      await Player.bulkSave([player1, player2]);
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/updateTwoPlayers");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and update both balances correctly", async () => {
      const response = await api
        .post("/api/updateTwoPlayers")
        .set(headers)
        .send({ targetId: "111", clientId: "222" });
      const correctTargetBalance = balanceUpdater({
        oldBalance: 0n,
        cps: 123,
        updatedAt: new Date("12.11.2022"),
      }).toString();
      const correctClientBalance = balanceUpdater({
        oldBalance: 0n,
        cps: 321,
        updatedAt: new Date("12.11.2022"),
      }).toString();

      expect(response.status).toBe(200);
      expect(response.body.target).toHaveProperty("discordId");
      expect(response.body.client).toHaveProperty("discordId");
      expect(response.body.target).toHaveProperty("discordDisplayName");
      expect(response.body.client).toHaveProperty("discordDisplayName");
      expect(response.body.target).toHaveProperty("balance");
      expect(response.body.client).toHaveProperty("balance");
      expect(response.body.target.balance.substring(0, 4)).toBe(
        correctTargetBalance.substring(0, 4)
      );
      expect(response.body.client.balance.substring(0, 4)).toBe(
        correctClientBalance.substring(0, 4)
      );
    });

    test("Should respond with 404 if we try to update a nonexisting player as client", async () => {
      const response = await api
        .post("/api/updateTwoPlayers")
        .set(headers)
        .send({ targetId: "111", clientId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toEqual("client not found");
    });

    test("Should respond with 404 if we try to update a nonexisting player as target", async () => {
      const response = await api
        .post("/api/updateTwoPlayers")
        .set(headers)
        .send({ targetId: "ThisDoesntExist", clientId: "222" });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toEqual("target not found");
    });
  });

  describe("POST /addBitToPlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "619",
        discordDisplayName: "testing addBitToPlayer",
        balance: 0,
        cps: 0,
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/addBitToPlayer");
      expect(response.status).toBe(401);
    });
    test("Should respond with 200 and add a bit to the player", async () => {
      const response = await api
        .post("/api/addBitToPlayer")
        .set(headers)
        .send({ discordId: "619" });
      expect(response.status).toBe(200);
      const player = await Player.findOne({ discordId: "619" });
      expect(player?.balance?.toString()).toEqual("1");
    });

    test("Should respond with 400 if we dont provide discordId in body", async () => {
      const response = await api.post("/api/addBitToPlayer").set(headers);
      expect(response.status).toBe(400);
    });

    test("Should respond with 404 if we try to add a bit to a nonexisting player", async () => {
      const response = await api
        .post("/api/addBitToPlayer")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });
  });

  describe("POST /resetPlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "155",
        discordDisplayName: "testing resetPlayer",
        balance: 123,
        cps: 321,
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/resetPlayer");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and reset the player", async () => {
      const response = await api
        .post("/api/resetPlayer")
        .set(headers)
        .send({ discordId: "155" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("cps");
      expect(response.body.balance).toEqual("0");
      expect(response.body.cps).toBe(0);
      expect(response.body.inventory).toBeInstanceOf(Array);
      expect(response.body.inventory).toHaveLength(0);
    });

    test("Should respond with 404 if we try to reset a nonexisting player", async () => {
      const response = await api
        .post("/api/resetPlayer")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });

    test("Should respond with 400 if we dont provide discordId in body", async () => {
      const response = await api.post("/api/resetPlayer").set(headers);
      expect(response.status).toBe(400);
    });
  });

  describe("POST /blacklistPlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "blacklistMe",
        discordDisplayName: "testing blacklistPlayer",
        balance: 123,
        cps: 321,
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/blacklistPlayer");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and blacklist the player, with no reason provided", async () => {
      const response = await api
        .post("/api/blacklistPlayer")
        .set(headers)
        .send({ discordId: "blacklistMe" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("cps");
      expect(response.body).toHaveProperty("blacklisted");
      expect(response.body.blacklisted.reason).toEqual("Reason not given");
      expect(response.body.blacklisted).toHaveProperty("started");
    });

    test("Should respond with 409, if we try to blacklist an already blacklisted player", async () => {
      const response = await api
        .post("/api/blacklistPlayer")
        .set(headers)
        .send({ discordId: "blacklistMe" });
      expect(response.status).toBe(409);
      expect(response.body.error).toEqual("player already blacklisted");
    });

    test("Should respond with 200 and blacklist the player, and attach a reason when we provide one", async () => {
      await Player.findOneAndUpdate(
        { discordId: "blacklistMe" },
        { blacklisted: null }
      );
      await client.del("blacklistMe");
      const reason = "testing blacklistPlayer";
      const response = await api
        .post("/api/blacklistPlayer")
        .set(headers)
        .send({ discordId: "blacklistMe", reason });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("cps");
      expect(response.body).toHaveProperty("blacklisted");
      expect(response.body.blacklisted.reason).toEqual(reason);
      expect(response.body.blacklisted).toHaveProperty("started");
    });
  });

  describe("POST /unblacklistPlayer", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "unblacklistMe",
        discordDisplayName: "testing unblacklistPlayer",
        balance: 123,
        cps: 321,
        blacklisted: {
          reason: "testing unblacklistPlayer",
          started: new Date("12.11.2022"),
        },
        createdAt: new Date("12.11.2022"),
        updatedAt: new Date("12.11.2022"),
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/unblacklistPlayer");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and unblacklist the player, and add it to the players blacklistHistory", async () => {
      const response = await api
        .post("/api/unblacklistPlayer")
        .set(headers)
        .send({ discordId: "unblacklistMe" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("discordId");
      expect(response.body).toHaveProperty("discordDisplayName");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("blacklisted");
      expect(response.body).toHaveProperty("blacklistHistory");
      expect(response.body.blacklisted).toBe(null);
      expect(response.body.blacklistHistory).toBeInstanceOf(Array);
      expect(response.body.blacklistHistory).toHaveLength(1);
      expect(response.body.blacklistHistory[0].reason).toEqual(
        "testing unblacklistPlayer"
      );
      expect(response.body.blacklistHistory[0].started).toEqual(
        new Date("12.11.2022").toISOString()
      );
    });

    test("Should respond with 409 if player is not blacklisted", async () => {
      const response = await api
        .post("/api/unblacklistPlayer")
        .set(headers)
        .send({ discordId: "unblacklistMe" });
      expect(response.status).toBe(409);
      expect(response.body.error).toEqual("player not blacklisted");
    });

    test("Should respond with 404 if we try to unblacklist an player that doesnt exist", async () => {
      const response = await api
        .post("/api/unblacklistPlayer")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });
  });

  describe("POST /redeemDaily", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "redeemDaily",
        discordDisplayName: "testing redeemDaily",
        balance: 0,
        cps: 0,
      });
    });
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/redeemDaily");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and give the player from 0 to 500 bits", async () => {
      const response = await api
        .post("/api/redeemDaily")
        .set(headers)
        .send({ discordId: "redeemDaily" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("balanceReward");
      expect(response.body.balanceReward).toBeGreaterThan(0);
      expect(response.body.balanceReward).toBeLessThanOrEqual(500);
      const player = await Player.findOne({ discordId: "redeemDaily" });
      expect(Number(player?.balance.toString())).toBeGreaterThan(0);
      expect(Number(player?.balance.toString())).toBeLessThanOrEqual(500);
      expect(player?.cps).toBe(0);
    });

    test("Should respond with 409 if same player tries to redeem daily twice", async () => {
      const response = await api
        .post("/api/redeemDaily")
        .set(headers)
        .send({ discordId: "redeemDaily" });
      expect(response.status).toBe(409);
      expect(response.body.error).toEqual("daily already redeemed");
      const player = await Player.findOne({ discordId: "redeemDaily" });
      expect(Number(player?.balance.toString())).toBeGreaterThan(0);
      expect(Number(player?.balance.toString())).toBeLessThanOrEqual(500);
      expect(player?.cps).toBe(0);
    });

    test("Should respond with 404 if we try to redeem daily on a nonexisting player", async () => {
      const response = await api
        .post("/api/redeemDaily")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });
  });

  describe("POST /openCrate", () => {
    beforeAll(async () => {
      await Player.create({
        discordId: "openCrate",
        discordDisplayName: "testing openCrate",
        balance: 0,
        cps: 0,
        unopenedCrates: 1,
      });
    });

    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.post("/api/openCrate");
      expect(response.status).toBe(401);
    });

    test("Should respond with 200 and give the player a random amount of bits from 0 to 1500, and an random item", async () => {
      const response = await api
        .post("/api/openCrate")
        .set(headers)
        .send({ discordId: "openCrate" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("balanceReward");
      expect(response.body).toHaveProperty("itemReward");
      expect(response.body.balanceReward).toBeGreaterThanOrEqual(0);
      expect(response.body.balanceReward).toBeLessThanOrEqual(1500);

      const player = await Player.findOne({ discordId: "openCrate" });
      expect(player?.openedCrates).toEqual(1);
      expect(player?.unopenedCrates).toEqual(0);
      expect(player?.inventory).toBeInstanceOf(Array);
      expect(player?.inventory).toHaveLength(1);
    });

    test("Should respond with 409 if player tries to open a crate, but doesnt have any to open.", async () => {
      const response = await api
        .post("/api/openCrate")
        .set(headers)
        .send({ discordId: "openCrate" });
      expect(response.status).toBe(409);
      expect(response.body.error).toEqual("no crates to open");
    });

    test("Should respond with 404 if we try to open a crate on a nonexisting player", async () => {
      const response = await api
        .post("/api/openCrate")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });
  });
});

describe("test PUT methods", () => {
  beforeAll(async () => {
    await Player.create({
      discordId: "PutTest",
      discordDisplayName: "testing /PUT updatePlayer",
      balance: 0,
      cps: 0,
    });
  });
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BOT_TOKEN}`,
  };
  describe("PUT /updatePlayer", () => {
    test("Should respond with 401 when no token is provided", async () => {
      const response = await api.put("/api/updatePlayer");
      expect(response.status).toBe(401);
    });
    test("Should respond with 400 if we provide no data", async () => {
      const response = await api.put("/api/updatePlayer").set(headers);
      expect(response.status).toBe(400);
    });

    test("Should respond with 404 if we try to update a nonexisting player", async () => {
      const response = await api
        .put("/api/updatePlayer")
        .set(headers)
        .send({ discordId: "ThisDoesntExist" });
      expect(response.status).toBe(404);
    });

    test("Should respond with 200 and update the player", async () => {
      const response = await api
        .put("/api/updatePlayer")
        .set(headers)
        .send({ discordId: "PutTest", balance: "1000" });
      expect(response.status).toBe(200);
      const player = await Player.findOne({ discordId: "PutTest" });
      expect(player?.balance.toString()).toEqual("1000");
    });
  });
});

afterAll(async () => {
  await disconnectFromDatabase();
  await disconnectFromCache();
});
