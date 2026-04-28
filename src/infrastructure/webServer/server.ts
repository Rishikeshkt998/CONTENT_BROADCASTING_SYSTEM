import express, { Application } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import logger from "../logging/winston/AppLogger";
import authRoutes from "../routes/authRoutes";
import contentRoutes from "../routes/contentRoutes";
import { RateLimitingMiddleware } from "../middleware/RateLimit/RateLimitingMiddleware";
import { NonceValidationMiddleware } from "../middleware/NonceValidation/NonceValidationMiddleware";
import { isNonceExcluded, isRateLimitExcluded } from "../config/excludedPaths";
import { ApiError } from "../../domain/errors/ApiError";

const createServer = async (): Promise<Application> => {
  const app: Application = express();
  const server: http.Server = http.createServer(app);

  app.use(cors());
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: false }));

  if (process.env.ENABLE_SECURITY_MIDDLEWARES === "true") {
    app.use("/api/", (req, res, next) => {
      if (isRateLimitExcluded(req.path)) {
        return next();
      }
      return RateLimitingMiddleware.generalRateLimit(req, res, next);
    });

    app.use("/api/", (req, res, next) => {
      if (isNonceExcluded(req.path)) {
        return next();
      }
      return NonceValidationMiddleware.validateNonce()(req, res, next);
    });

    // Schedule periodic cleanup of expired nonces
    if (process.env.ENABLE_NONCE_CLEANUP === "true") {
      const cleanupIntervalSeconds = parseInt(
        process.env.NONCE_CLEANUP_INTERVAL || "3600"
      );
      const cleanupIntervalMs = cleanupIntervalSeconds * 1000;

      logger.info(
        `[Security] Nonce cleanup scheduled every ${cleanupIntervalSeconds} seconds (${cleanupIntervalSeconds / 60} minutes)`
      );

      // Run cleanup immediately on startup
      NonceValidationMiddleware.cleanupExpiredNonces().catch((err) => {
        logger.error("[Security] Initial nonce cleanup failed:", err);
      });

      // Schedule periodic cleanup
      setInterval(() => {
        NonceValidationMiddleware.cleanupExpiredNonces().catch((err) =>
          logger.error("[Security] Scheduled nonce cleanup failed:", err)
        );
      }, cleanupIntervalMs);
    }
  }

  // Static files for uploads
  app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

  // REST Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/content', contentRoutes);

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
      logger.error(`[${err.useCase}] ${err.message}`);
      
      // Safety check: Ensure status code is valid for Express (100-599)
      const httpStatus = (err.code >= 100 && err.code < 600) ? err.code : 400;

      res.status(httpStatus).json({
        status: false,
        msg: err.message,
        errorCode: err.code,
        errorDetails: err.errorDetails,
        useCase: err.useCase
      });
      return;
    }
    
    logger.error(err.message || 'Unknown Error');
    res.status(500).json({ status: false, msg: 'Internal Server Error' });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    logger.info(`[Server] ⚡️: Server is running on http://localhost:${PORT}`);
  });

  return app;
};

export default createServer;
