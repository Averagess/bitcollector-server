import * as dotenv from "dotenv";
import { logger } from "./logger";
dotenv.config();

const errors = [];
const warnings = [];

if(!process.env.MONGODB_URI) errors.push("MONGODB_URI is not defined in .env file");
if(!process.env.ADMIN_USERNAME) errors.push("ADMIN_USERNAME is not defined in .env file");
if(!process.env.ADMIN_PASSWORD) errors.push("ADMIN_PASSWORD is not defined in .env file");
if(!process.env.ADMIN_TOKEN) errors.push("ADMIN_TOKEN is not defined in .env file");
if(!process.env.BOT_TOKEN) errors.push("BOT_TOKEN is not defined in .env file");
if(!process.env.MONGODB_DEV_URI && (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development")) errors.push("ENV was set to test or dev but MONGODB_DEV_URI wasn not defined in .env file");
if(!process.env.REDIS_URL) errors.push("REDIS_URL was not defined in .env file");

if(!process.env.ENABLE_ANALYTIC_SENDING) warnings.push("ENABLE_ANALYTIC_SENDING was not defined in .env file, defaulting to false");
if(process.env.DISABLE_CACHE === "true") warnings.push("DISABLE_CACHE was set to true in .env file. This is not recommended for production use.");

if(process.env.ENABLE_ANALYTIC_SENDING === "true") {
  if(!process.env.BOT_ID) errors.push("BOT_ID was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  if(!process.env.TOPGG_TOKEN) errors.push("TOPGG_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  if(!process.env.DISCORDBOTLIST_TOKEN) errors.push("DISCORDBOTLIST_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  if(!process.env.DISCORDS_TOKEN) errors.push("DISCORDS_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
  if(!process.env.DISCORDBOTS_TOKEN) errors.push("DISCORDBOTS_TOKEN was not defined in env variables, and you have ENABLE_ANALYTIC_SENDING set to true");
}

if(errors.length > 0 || warnings.length > 0) {
  if(errors.length > 0) logger.warn(`Detected ${errors.length} misconfigurations.`);
  for(let i = 0; i < errors.length; i++) {
    logger.error(errors[i]);
  }

  for(let i = 0; i < warnings.length; i++) {
    logger.warn(warnings[i]);
  }

  if(errors.length > 0) {
    logger.error("Please fix the above errors and restart.");
    process.exit(1);
  }
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
export const DISABLE_CACHE = process.env.DISABLE_CACHE === "true";

export const ENABLE_ANALYTIC_SENDING = process.env.ENABLE_ANALYTIC_SENDING === "true";
export const BOT_ID = process.env.BOT_ID;
export const TOPGG_TOKEN = process.env.TOPGG_TOKEN;
export const DISCORDBOTLIST_TOKEN = process.env.DISCORDBOTLIST_TOKEN;
export const DISCORDS_TOKEN = process.env.DISCORDS_TOKEN;
export const DISCORDBOTS_TOKEN = process.env.DISCORDBOTS_TOKEN;
