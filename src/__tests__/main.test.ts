import app from "../app";
import { connectToDatabase } from "../utils/db";
import player from "../models/player";
const supertest = require("supertest");

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabase();
  await player.deleteMany({});
  await player.create({
    discordId: "123",
    discordDisplayName: "test",
    balance: 0,
    cps: 5,
    inventory: [],
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  });
});

describe("Test GET Methods", () => {
  it("GET /allPlayers responds with the test player only", async () => {
    const res = await api.get("/allPlayers");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].discordId).toBe("123");
    expect(res.body[0].cps).toBe(5);
  });
  it("Get /allItems responds 200 and has atleast 5 items", async () => {
    const res = await api.get("/allItems");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(5);
  });
  it("Get /leaderboard responds 200 and has atleast 1 player, first player is test player", async () => {
    const res = await api.get("/leaderboard");
    const body = res.body.players;
    expect(res.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].discordId).toBe("123");
  });
});

describe("Test POST Methods with correct arguments", () => {
  it("/addBitToPlayer adds a bit to player's balance but does not update timestamps", async () => {
    const res = await api.post("/addBitToPlayer").send({
      discordId: "123",
    });
    expect(res.status).toBe(200);

    const newPlayer = await player.findOne({ discordId: "123" });

    expect(newPlayer.balance.toString()).toBe("1");
    expect(newPlayer.updatedAt.toString()).toBe(new Date("2023-01-15T00:00:00.000Z").toString());
  });

  it("/updatePlayer updates player balance correctly", async () => {
    const res = await api.post("/updatePlayer").send({
      discordId: "123",
    });
    expect(res.status).toBe(200);
    const secondsSinceLastUpdate = Math.floor(
      (new Date(res.body.updatedAt).getTime() -
        new Date("2023-01-15").getTime()) /
        1000
    );
    const correctBalance = res.body.balance + secondsSinceLastUpdate * 5;
    const bal = res.body.balance;
    const first4Bal = bal.toString().slice(0, 4);
    const first4Corr = correctBalance.toString().slice(0, 4);
    expect(first4Bal).toBe(first4Corr);
  });
  it("/getShopForPlayer returns 200 and has atleast 5 items", async () => {
    const res = await api.post("/getShopForPlayer").send({
      discordId: "123",
    });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(5);
  });
  it("/initPlayer for completely new player returns 200 and correct properties", async () => {
    const res = await api.post("/initPlayer").send({
      discordId: "456",
      discordDisplayName: "test2",
    });
    expect(res.status).toBe(200);
    expect(res.body.discordId).toBe("456");
    expect(res.body.balance).toBe("0");
    expect(res.body.cps).toBe(0);
    expect(res.body.inventory).toEqual([]);
  });
  it("/buyItem with valid balance returns 200 and correct properties", async () => {
    const oldPlayer = await api.post("/updatePlayer").send({
      discordId: "123",
    });

    const res = await api.post("/buyItem").send({
      discordId: "123",
      itemName: "1",
    });

    const newBal = BigInt(res.body.player.balance);
    const oldBal = BigInt(oldPlayer.body.balance);

    expect(res.status).toBe(200);
    expect(newBal).toBeLessThan(oldBal);
    expect(res.body.player.cps).toBeGreaterThan(5);
    expect(res.body.player.inventory.length).toBe(1);
  });
});


describe("Test POST Methods with no discordId argument", () => {
  it("/getShopForPlayer with no discordId returns 400", async () => {
    const res = await api.post("/getShopForPlayer").send({
    });
    expect(res.status).toBe(400);
  });
  it("/initPlayer with no discordId returns 400", async () => {
    const res = await api.post("/initPlayer").send({
      discordDisplayName: "test2",
    });
    expect(res.status).toBe(400);
  });
  it("/buyItem with no discordId returns 400", async () => {
    const res = await api.post("/buyItem").send({
      itemName: "1",
    });
    expect(res.status).toBe(400);
  });
  it("/updatePlayer with no discordId returns 400", async () => {
    const res = await api.post("/updatePlayer").send({});
    expect(res.status).toBe(400);
  });
  it("/addBitToPlayer with no discordId returns 400", async () => {
    const res = await api.post("/addBitToPlayer").send({
    });
    expect(res.status).toBe(400);
  });
})

describe("Test POST Methods with an discordId that doesnt have an account", () => {
  it("/getShopForPlayer with nonexisting discordId returns 404", async() => {
    const res = await api.post("/getShopForPlayer").send({
      discordId: "789",
    });
    expect(res.status).toBe(404);
  })
  it("/buyItem with nonexisting discordId returns 404", async() => {
    const res = await api.post("/buyItem").send({
      discordId: "789",
      itemName: "1",
    });
    expect(res.status).toBe(404);
  })
  it("/updatePlayer with nonexisting discordId returns 404", async() => {
    const res = await api.post("/updatePlayer").send({
      discordId: "789",
    });
    expect(res.status).toBe(404);
  })
  it("/addBitToPlayer with nonexisting discordId returns 404", async() => {
    const res = await api.post("/addBitToPlayer").send({
      discordId: "789",
    });
    expect(res.status).toBe(404);
  })
})

describe("Test buying an item with insufficient balance", () => {
  it("/buyItem with insufficient balance returns 400, error msg: not enough money", async () => {
    const res = await api.post("/buyItem").send({
      discordId: "456",
      itemName: "5",
      amount: "100000000000"
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("not enough money")
  });
});

describe("Test /resetPlayer", () => {
  it("resetPlayer with existing account returns 200 and correct properties", async () => {
    const res = await api.post("/resetPlayer").send({
      discordId: "123",
    });
    expect(res.status).toBe(200);
    expect(res.body.discordId).toBe("123");
    expect(res.body.balance).toBe("0");
    expect(res.body.cps).toBe(0);
    expect(res.body.inventory).toEqual([]);
  });
  it("resetPlayer with nonexisting account returns 404 and correct properties", async () => {
    const res = await api.post("/resetPlayer").send({
      discordId: "789",
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("player not found");
  });
  it("resetPlayer with no discordId returns 400 and correct properties", async () => {
    const res = await api.post("/resetPlayer").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("discordId is required");
  }
  )
})