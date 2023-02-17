import axios from "axios";

import { BOT_ID, TOPGG_TOKEN, DISCORDBOTLIST_TOKEN, DISCORDS_TOKEN, DISCORDBOTS_TOKEN } from "../utils/config";
import { logger } from "../utils/logger";

export const sendAnalyticsToTopGG = async (server_count: number) => {
  const headers = {
    Authorization: TOPGG_TOKEN
  };
  try {
    logger.info("POST:ing analytics to top.gg");
    const { status } = await axios.post(`https://top.gg/api/bots/${BOT_ID}/stats`, { server_count }, { headers });
    logger.info(`Successfully POST:ed analytics to top.gg with status code ${status}`);
  } catch (error) {
    logger.error("Failed to POST analytics to top.gg, error below");
    logger.error(error);
  }
};

export const sendAnalyticsToDiscordBotList = async (server_count: number) => {
  const headers = {
    Authorization: DISCORDBOTLIST_TOKEN
  };

  try {
    logger.info("POST:ing analytics to discordbotlist.com");
    const { status } = await axios.post(`https://discordbotlist.com/api/v1/bots/${BOT_ID}/stats`, { guilds: server_count }, { headers });
    logger.info(`Successfully POST:ed analytics to discordbotlist.com with status code ${status}`);
  } catch (error) {
    logger.error("Failed to POST analytics to discordbotlist.com, error below");
    logger.error(error);
  }
};

export const sendAnalyticsToDiscords = async (server_count: number) => {
  const headers = {
    Authorization: DISCORDS_TOKEN
  };

  try {
    logger.info("POST:ing analytics to discords.com");
    const { status } = await axios.post(`https://discords.com/bots/api/bot/${BOT_ID}`, { server_count }, { headers });
    logger.info(`Successfully POST:ed analytics to discords.com with status code ${status}`);
  } catch (error) {
    logger.error("Failed to POST analytics to discords.com, error below");
    logger.error(error);
  }
};

export const sendAnalyticsToDiscordBots = async (server_count: number) => {
  const headers = {
    Authorization: DISCORDBOTS_TOKEN
  };

  try {
    logger.info("POST:ing analytics to discord.bots.gg");
    const { status } = await axios.post(`https://discord.bots.gg/api/v1/bots/${BOT_ID}/stats`, { guildCount: server_count }, { headers });
    logger.info(`Successfully POST:ed analytics to discord.bots.gg with status code ${status}`);
  } catch (error) {
    logger.error("Failed to POST analytics to discord.bots.gg, error below");
    logger.error(error);
  }
};