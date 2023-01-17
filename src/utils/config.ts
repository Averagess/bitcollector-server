import * as dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env file");

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI
}

export default config;