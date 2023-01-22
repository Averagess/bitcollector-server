import player from "../models/player";
import { connectToDatabase } from "../utils/db";

const func = async () => {
  await connectToDatabase();
  console.log("FORMATTING DB :D")
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
}
export default func