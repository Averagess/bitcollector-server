
import app from "../app";
const supertest = require("supertest");

const api = supertest(app);

describe("Test every GET endpoint without authentication header, every endpoint should return status 401, with correct body", () => {
  it("GET /allPlayers", async () => {
    const res = await api.get("/allPlayers");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /allItems", async () => {
    const res = await api.get("/allItems");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /leaderboard", async () => {
    const res = await api.get("/leaderboard");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /blacklist", async () => {
    const res = await api.get("/blacklist");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("/updateAllPlayers", async () => {
    const res = await api.get("/updateAllPlayers");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
})

describe("Test every GET endpoint with incorrect authorization key, every endpoint should return 401 with correct properties", () => {
  it("GET /allPlayers", async () => {
    const res = await api.get("/allPlayers").set("Authorization", "Bearer INCORRECT")
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /allItems", async () => {
    const res = await api.get("/allItems").set("Authorization", "Bearer INCORRECT")
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /leaderboard", async () => {
    const res = await api.get("/leaderboard").set("Authorization", "Bearer INCORRECT")
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /blacklist", async () => {
    const res = await api.get("/blacklist").set("Authorization", "Bearer INCORRECT")
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("GET /updateAllPlayers", async () => {
    const res = await api.get("/updateAllPlayers").set("Authorization", "Bearer INCORRECT")
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
})

describe("Test every POST endpoint without authentication header, every endpoint should return status 401, with correct body", () => {
  const body = {
    discordId: "123",
    discordDisplayName: "test",
    itemName: "1",
    amount: 1
  }
  it("POST /getShopForPlayer", async () => {
    const res = await api.post("/getShopForPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /initPlayer", async () => {
    const res = await api.post("/initPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /buyItem", async() => {
    const res = await api.post("/buyItem").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /updatePlayer", async () => {
    const res = await api.post("/updatePlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /addBitToPlayer", async () => {
    const res = await api.post("/addBitToPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /resetPlayer", async () => {
    const res = await api.post("/resetPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /blacklistPlayer", async () => {
    const res = await api.post("/blacklistPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /unblacklistPlayer", async () => {
    const res = await api.post("/unblacklistPlayer").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /redeemDaily", async () => {
    const res = await api.post("/redeemDaily").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
})

describe("Test every POST endpoint with incorrect authorization key, every endpoint should return 401 with correct properties", () => {
  const body = {
    discordId: "123",
    discordDisplayName: "test",
    itemName: "1",
    amount: 1
  }
  it("POST /getShopForPlayer", async () => {
    const res = await api.post("/getShopForPlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /initPlayer", async () => {
    const res = await api.post("/initPlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /buyItem", async() => {
    const res = await api.post("/buyItem").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /updatePlayer", async () => {
    const res = await api.post("/updatePlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /addBitToPlayer", async () => {
    const res = await api.post("/addBitToPlayer").set("Authorization","Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /resetPlayer", async () => {
    const res = await api.post("/resetPlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /blacklistPlayer", async () => {
    const res = await api.post("/blacklistPlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /unblacklistPlayer", async () => {
    const res = await api.post("/unblacklistPlayer").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
  it("POST /redeemDaily", async () => {
    const res = await api.post("/redeemDaily").set("Authorization", "Bearer INCORRECT").send(body);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })
})