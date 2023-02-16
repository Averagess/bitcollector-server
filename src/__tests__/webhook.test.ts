import { BOT_TOKEN } from "../utils/config";
import app from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../utils/db";
import { Player } from "../models";
import { connectToCache, client, disconnectFromCache } from "../utils/redis";
import supertest from "supertest";

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabase();
  await connectToCache();
  await client.flushAll();
  await Player.deleteMany({});
  await Player.create({
    discordId: "123456789",
    discordDisplayName: "Testing webhooks",
    balance: "0",
    cps: 0,
  });
});

afterAll(async () => {
  await Player.deleteMany({});
  await disconnectFromDatabase();
  await disconnectFromCache();
});

describe("Webhook", () => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${BOT_TOKEN}`,
  };

  describe("/webhooks/topgg", () => {
    test("Should return 401 if we dont provide a token", async () => {
      await api
        .post("/webhooks/topgg")
        .expect(401)
        .expect({ error: "Unauthorized" });
    });
    test("Should return 400 'invalid request body' with no body", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .expect(400)
        .expect({ error: "Invalid request body" });
    });
    test("Should return 400 'invalid request body' user is an number", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: 123, type: "upvote", isWeekend: false })
        .expect(400)
        .expect({ error: "Invalid request body" });
    });
    test("Should return 400 'invalid request body' if type is an number", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "123", type: 123, isWeekend: false })
        .expect(400)
        .expect({ error: "Invalid request body" });
    });

    test("Should return 200 and give player 2 crates if isWeekend is an boolean true string", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: "true" })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(2);
    });
    test("Should return 200 and give player 1 crate if isWeekend is an boolean false string", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: "false" })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(3);
    });
    test("Should return 200 and give player 2 crates if isWeekend is true", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: true })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(5);
    });
    test("Should return 200 and give player 1 crate if isWeekend is false", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: false })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(6);
    });
    test("Should return 404 if player doesnt exist", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "lol", type: "upvote", isWeekend: true })
        .expect(404);
    });
    test("Should return 400 if isWeekend is an random string", async () => {
      await api
        .post("/webhooks/topgg")
        .set(headers)
        .send({ user: "lol", type: "upvote", isWeekend: "lol" })
        .expect(400);
    });
  });

  describe("/webhooks/discords", () => {
    test("Should return 401 if we dont provide a token", async () => {
      await api
        .post("/webhooks/discords")
        .expect(401)
        .expect({ error: "Unauthorized" });
    });

    test("Should return 401 if we provide an invalid token", async () => {
      await api
        .post("/webhooks/discords")
        .set({ ...headers, Authorization: "Bearer INCORRECT_TOKEN" })
        .expect(401)
        .expect({ error: "Unauthorized" });
    });

    test("Should return 200 and give player 1 crate when discords sends a vote for existing user", async () => {
      await api
        .post("/webhooks/discords")
        .set(headers)
        .send({
          type: "vote",
          user: "123456789",
        })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(7);
    });

    test("Should return 404 and not give player 1 crate when discords sends a vote for non existing user", async () => {
      await api
        .post("/webhooks/discords")
        .set(headers)
        .send({
          type: "vote",
          user: "idontexist"
        });
    });
  });

  describe("webhooks/discordbotlist", () => {
    test("Should return 401 if we dont provide a token", async () => {
      await api
        .post("/webhooks/discordbotlist")
        .expect(401)
        .expect({ error: "Unauthorized" });
    });

    test("Should return 401 if we provide an invalid token", async () => {
      await api
        .post("/webhooks/discordbotlist")
        .set({ ...headers, Authorization: "Bearer INCORRECT_TOKEN" })
        .expect(401)
        .expect({ error: "Unauthorized" });
    });

    test("Should return 200 and give player 1 crate when discords sends a vote for existing user", async () => {
      await api
        .post("/webhooks/discordbotlist")
        .set(headers)
        .send({
          id: "123456789",
        })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player?.unopenedCrates).toBe(8);
    });

    test("Should return 404 and not give player 1 crate when discords sends a vote for non existing user", async () => {
      await api
        .post("/webhooks/discordbotlist")
        .set(headers)
        .send({
          id: "idontexist"
        });
    });
  });
});
