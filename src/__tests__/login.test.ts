import { ADMIN_PASSWORD, ADMIN_TOKEN, ADMIN_USERNAME } from "../utils/config";
import app from "../app";
const supertest = require("supertest");
const api = supertest(app);

describe("Login", () => {
  test("/login responds with 400 when username or password is missing", async () => {
    const response = await api.post("/login");
    expect(response.status).toBe(400);
  });

  test("/login responds with 401 when username or password is invalid", async () => {
    const response = await api.post("/login").send({ username: "wrong", password: "wrong" });
    expect(response.status).toBe(401);
  });

  test("/login responds with 200 when username and password is valid and returns a token", async () => {
    const response = await api.post("/login").send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.token).toEqual(ADMIN_TOKEN);
  })
})