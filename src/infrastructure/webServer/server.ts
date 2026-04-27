import express, { Application } from "express";
import http from "http";
import cors from "cors";
import path from "path";
import logger from "../logging/winston/AppLogger";
import authRoutes from "../routes/authRoutes";
import contentRoutes from "../routes/contentRoutes";
import { RateLimitingMiddleware } from "../middleware/RateLimit/RateLimitingMiddleware";
import { NonceValidationMiddleware } from "../middleware/NonceValidation/NonceValidationMiddleware";
import { ApiError } from "../../domain/errors/ApiError";

const createServer = async (): Promise<Application> => {
  const app: Application = express();
  const server: http.Server = http.createServer(app);

  app.use(cors());
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: false }));

  // Global Rate Limiting
  app.use(RateLimitingMiddleware.generalRateLimit);

  // Nonce Validation (Optional based on env)
  app.use(NonceValidationMiddleware.validateNonce());

  // Static files for uploads
  app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));

  // REST Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/content', contentRoutes);

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof ApiError) {
      logger.error(`[${err.useCase}] ${err.message}`);
      res.status(err.code || 500).json({
        status: false,
        msg: err.message,
        errorCode: err.errorCode,
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
