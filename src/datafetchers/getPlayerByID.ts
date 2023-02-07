import { Player } from "../models";

import { client } from "../utils/redis";
import { logger } from "../utils/logger";
import { PlayerInterface } from "../types";


const getPlayerByID = async (discordId: string): Promise<PlayerInterface | null> => {
  // First try to get the player from the cache
  const cachedPlayer = await client.get(discordId);
  if(cachedPlayer) {
    logger.info(`Player with discordId ${discordId} found in cache`);
    return JSON.parse(cachedPlayer);
  }

  // If not in cache, its a cache miss. Try to get the player from the database
  const player = await Player.findOne({ discordId });

  // If the player is found in the database, cache it and return it
  if(player) {
    logger.info(`Player with discordId ${discordId} found in database`);
    client.set(discordId, JSON.stringify(player.toJSON()));
    return player;
  }

  // If the player wasnt found neither the cache or database, return null
  logger.info(`Player with discordId ${discordId} not found in cache or database.`);
  return null;
};

export default getPlayerByID;