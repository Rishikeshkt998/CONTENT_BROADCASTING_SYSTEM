import express, { Application } from "express";
import logger from "../logging/winston/AppLogger";
import { postgraphile } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import PgAggregatesPlugin from "@graphile/pg-aggregates";

export const createGraphqlServer = async (): Promise<Application> => {
  const app: Application = express();

  const DB_URI = process.env.DATABASE_URL || process.env.DB_URI;

  if (DB_URI) {
    const isLocal = DB_URI.includes("localhost") || DB_URI.includes("127.0.0.1");

    const graphql = postgraphile(DB_URI, "public", {
      watchPg: isLocal,
      graphiql: true,
      enhanceGraphiql: true,
      appendPlugins: [ConnectionFilterPlugin as any, PgAggregatesPlugin as any],
      dynamicJson: true,
      retryOnInitFail: true, // Prevents crash if DB is waking up
      graphileBuildOptions: {
        connectionFilterAllowNullInput: true,
        connectionFilterAllowEmptyObjectInput: true,
      },
      enableCors: true,
    });
    app.use(graphql);
  } else {
    logger.error("[GRAPHQL] ❌: DB_URI is not defined");
  }

  const PORT = process.env.GRAPHQL_PORT || 4000;
  app.listen(PORT, () => {
    logger.info(
      `[GRAPHQL] ⚡️: Postgraphile is running on http://localhost:${PORT}/graphiql`
    );
  });
  return app;
};
