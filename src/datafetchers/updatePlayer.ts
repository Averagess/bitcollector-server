import { Player } from "../models";
import { PlayerInterface } from "../types";
import { client } from "../utils/redis";
import { logger } from "../utils/logger";
import { DISABLE_CACHE } from "../utils/config";

const updatePlayer = async (player: PlayerInterface, timestamps: boolean): Promise<PlayerInterface | null> => {
  // First we need to find the player in the database
  const updatedPlayer = await Player.findOneAndUpdate({ discordId: player.discordId }, { ...player }, { new: true, timestamps });

  if(DISABLE_CACHE) return updatedPlayer;

  // If the player exists in the database, we return it and save it in cache
  if(updatedPlayer) {
    logger.info("Player saved in database, updating cache...");
    client.set(updatedPlayer.discordId, JSON.stringify(updatedPlayer));
    return updatedPlayer;
  }
  else {
    // If the player doesn't exist in the database, we return null
    logger.error("Player not found in database, returning null...");
    return null;
  }

};

export default updatePlayer;
