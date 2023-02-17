import * as dotenv from "dotenv";
import { logger } from "./logger";
dotenv.config();


if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env file");
else if(!process.env.ADMIN_USERNAME) throw new Error("ADMIN_USERNAME is not defined in .env file");
else if(!process.env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not defined in .env file");
else if(!process.env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN is not defined in .env file");
else if(!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is not defined in .env file");
else if(!process.env.MONGODB_DEV_URI && (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development")) throw new Error("ENV was set to test or dev but MONGODB_DEV_URI wasn not defined in .env file");
else if(!process.env.REDIS_URL) throw new Error("REDIS_URL was not defined in .env file");

else if(!process.env.ENABLE_ANALYTIC_SENDING) logger.warn("ENABLE_ANALYTIC_SENDING was not defined in .env file, defaulting to false");

if(process.env.ENABLE_ANALYTIC_SENDING === "true") {
  if(!process.env.BOT_ID) throw new Error("BOT_ID was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  else if(!process.env.TOPGG_TOKEN) throw new Error("TOPGG_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  else if(!process.env.DISCORDBOTLIST_TOKEN) throw new Error("DISCORDBOTLIST_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  else if(!process.env.DISCORDS_TOKEN) throw new Error("DISCORDS_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  else if(!process.env.DISCORDBOTS_TOKEN) throw new Error("DISCORDBOTS_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
}

export const PORT = Number(process.env.PORT) || 3000;
export const ENVIRONMENT = process.env.NODE_ENV;
export const MONGODB_URI = process.env.MONGODB_URI;
export const MONGODB_DEV_URI = process.env.MONGODB_DEV_URI || null;
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const CI = process.env.CI || false;
export const REDIS_URL = process.env.REDIS_URL;

export const ENABLE_ANALYTIC_SENDING = process.env.ENABLE_ANALYTIC_SENDING === "true";
export const BOT_ID = process.env.BOT_ID;
export const TOPGG_TOKEN = process.env.TOPGG_TOKEN;
export const DISCORDBOTLIST_TOKEN = process.env.DISCORDBOTLIST_TOKEN;
export const DISCORDS_TOKEN = process.env.DISCORDS_TOKEN;
export const DISCORDBOTS_TOKEN = process.env.DISCORDBOTS_TOKEN;