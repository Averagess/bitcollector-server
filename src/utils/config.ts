import * as dotenv from 'dotenv';
import { logger } from './logger';
dotenv.config();


if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env file");
else if(!process.env.ADMIN_USERNAME) throw new Error("ADMIN_USERNAME is not defined in .env file");
else if(!process.env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD is not defined in .env file");
else if(!process.env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN is not defined in .env file");
else if(!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is not defined in .env file")
else if(!process.env.MONGODB_DEV_URI && (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev")) logger.warn("MONGODB_DEV_URI is not defined in .env file. Tests will throw an error if you try to run them.")

const config = {
  PORT: process.env.PORT || 3000,
  ENVIRONMENT: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DEV_URI: process.env.MONGODB_DEV_URI || null,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  BOT_TOKEN: process.env.BOT_TOKEN
}

export default config;