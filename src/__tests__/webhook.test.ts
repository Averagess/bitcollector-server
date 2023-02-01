import { BOT_TOKEN } from "../utils/config";
import app from "../app";
import { connectToDatabase, disconnectFromDatabase } from "../utils/db";
import Player from "../models/player";
const supertest = require("supertest");

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabase();
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
});

describe("Webhook", () => {
  describe("/webhooks/vote", () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOT_TOKEN}`,
    };
    test("Should return 401 if we dont provide a token", async () => {
      await api
        .post("/webhooks/vote")
        .expect(401)
        .expect({ error: "Unauthorized" });
    });
    test("Should return 400 'invalid request body' with no body", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .expect(400)
        .expect({ error: "Invalid request body" });
    });
    test("Should return 400 'invalid request body' user is an number", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: 123, type: "upvote", isWeekend: false })
        .expect(400)
        .expect({ error: "Invalid request body" });
    });
    test("Should return 400 'invalid request body' if type is an number", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "123", type: 123, isWeekend: false })
        .expect(400)
        .expect({ error: "Invalid request body" });
    });

    test("Should return 200 and give player 2 crates if isWeekend is an boolean true string", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: "true" })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player.unopenedCrates).toBe(2);
    });
    test("Should return 200 and give player 1 crate if isWeekend is an boolean false string", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: "false" })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player.unopenedCrates).toBe(3);
    });
    test("Should return 200 and give player 2 crates if isWeekend is true", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: true })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player.unopenedCrates).toBe(5);
    });
    test("Should return 200 and give player 1 crate if isWeekend is false", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "123456789", type: "upvote", isWeekend: false })
        .expect(200);
      const player = await Player.findOne({ discordId: "123456789" });
      expect(player.unopenedCrates).toBe(6);
    });
    test("Should return 404 if player doesnt exist", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "lol", type: "upvote", isWeekend: true })
        .expect(404);
    });
    test("Should return 400 if isWeekend is an random string", async () => {
      await api
        .post("/webhooks/vote")
        .set(headers)
        .send({ user: "lol", type: "upvote", isWeekend: "lol" })
        .expect(400);
    });
  });
});
