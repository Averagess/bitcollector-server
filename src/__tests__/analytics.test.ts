import supertest from "supertest";

import app from "../app";
import { Analytics } from "../models";
import { BOT_TOKEN } from "../utils/config";
import { connectToDatabase, disconnectFromDatabase } from "../utils/db";

const api = supertest(app);

beforeAll(async () => {
  await connectToDatabase();
  await Analytics.deleteMany({});
});

afterAll(async () => {
  await disconnectFromDatabase();
});

describe("Analytics", () => {
  describe("POST /api/analytics/update", () => {
    const headers = { Authorization: `Bearer ${BOT_TOKEN}` };

    test("Should return 401 if no token is provided", async () => {
      const response = await api
        .post("/api/analytics/update")
        .send({});

      expect(response.status).toBe(401);
    });
    test("Should return 400 if no data is provided", async () => {
      const response = await api
        .post("/api/analytics/update")
        .set(headers)
        .send({});

      expect(response.status).toBe(400);
    });

    test("Should return 400 if both guildAmount and userAmount are provided but the first one is a string", async () => {
      const response = await api
        .post("/api/analytics/update").set(headers)
        .set(headers)
        .send({
          guildAmount: "a",
          userAmount: 1,
        });

      expect(response.status).toBe(400);
    });

    test("Should return 400 if both guildAmount and userAmount are provided but the second one is a string", async () => {
      const response = await api
        .post("/api/analytics/update")
        .set(headers)
        .send({
          guildAmount: 1,
          userAmount: "a",
        });

      expect(response.status).toBe(400);
    });

    test("Should return 200 when both guildAmount and userAmount are provided and are numbers, and result is saved to DB", async () => {
      const response = await api
        .post("/api/analytics/update")
        .set(headers)
        .send({
          guildAmount: 1,
          userAmount: 1,
        });

      expect(response.status).toBe(200);

      const result = await Analytics.findOne({});
      expect(result).not.toBeNull();
      expect(result?.guildAmount).toBe(1);
      expect(result?.userAmount).toBe(1);
    });
  });

  describe("GET /api/analytics", () => {
    beforeAll(async () => {
      await api.post("/api/analytics/update").set({ Authorization: `Bearer ${BOT_TOKEN}` }).send({
        guildAmount: 25,
        userAmount: 25,
      });
    });

    test("Should return 200 and the latest analytics entry", async () => {
      const response = await api
        .get("/api/analytics")
        .set({ Authorization: `Bearer ${BOT_TOKEN}` });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("guildAmount");
      expect(response.body).toHaveProperty("userAmount");
      expect(response.body.guildAmount).toBe(25);
      expect(response.body.userAmount).toBe(25);
    });

    test("Should return 401 if no token is provided", async () => {
      await api.get("/api/analytics").expect(401);
    });

    test("Should return 404 if no analytics exist in the database", async () => {
      await Analytics.deleteMany({});
      const response = await api.get("/api/analytics").set({ Authorization: `Bearer ${BOT_TOKEN}` });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("No analytics found");
    });
  });
});
