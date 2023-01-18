import * as dotenv from 'dotenv';
dotenv.config();

if(!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env file");
else if(!process.env.MONGODB_TEST_URI) console.warn("MONGODB_TEST_URI is not defined in .env file. Tests will throw an error if you try to run them.")

const config = {
  PORT: process.env.PORT || 3000,
  ENVIRONMENT: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || null,
}

export default config;