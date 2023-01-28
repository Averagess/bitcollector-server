import { connectToDatabase } from "../utils/db"

import Player from "../models/player"

const playerNames = [
  'John',
  'Paul',
  'George',
  'Ringo',
  'Pete',
  'Mike',
  'Dave',
  'Mick',
  'Keith',
]

const players = playerNames.map((player, index) => {
  const discordDisplayName = player + `#${1000 * index}`
  const discordId = Math.floor(Math.random() * 100000000000000).toString();
  const balance = Math.floor(Math.random() * 10000000000000).toString()
  const cps = (Math.random() * 10000000000000).toString()

  const newPlayer = new Player({
    discordDisplayName,
    discordId,
    balance,
    cps,
  })

  return newPlayer
})

const main = async () => {
  await connectToDatabase()

  console.log("Wiping database from old records");
  await Player.deleteMany({})
  console.log("Database wiped");

  console.log("Populating database with new records");
  await Player.insertMany(players)
  console.log("Database populated");
  console.log("Exiting script");

  process.exit(0)
}

main()

