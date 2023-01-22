import app from "../app";
import supertest from "supertest";

import func from "./setupDB";

const api = supertest(app);

beforeAll(async () => {
  await func();
});


describe("GET /allPlayers with correct api key should return 1 player with proper properties", () => {
  it("GET /allPlayers", async () => {
    const res = await api.get("/allPlayers").set("Authorization", "Bearer PwdkIEkslESQweFso1Odw3DxC22Ax4")
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].discordId).toBe("123");
    expect(res.body[0].discordDisplayName).toBe("test");
    expect(res.body[0].balance).toBe("0");
    expect(res.body[0].cps).toBe(5);
    expect(res.body[0].inventory).toEqual([]);
  })
})