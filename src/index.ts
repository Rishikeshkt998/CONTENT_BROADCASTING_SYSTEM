import dotenv from 'dotenv';
dotenv.config();

import logger from "./infrastructure/logging/winston/AppLogger";
import createServer from "./infrastructure/webServer/server";
import { createGraphqlServer } from "./infrastructure/webServer/postgraphile";

// Start the server
const start = async (): Promise<void> => {
  try {
    const server = await createServer();
    const graphqlServer = await createGraphqlServer();
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
