import { Request, Response, NextFunction } from "express";
import { container } from "../../ioc/registry";
import crypto from "crypto";
import { ApiError } from "../../../domain/errors/ApiError";
import ErrorCode from "../../../domain/enums/ErrorCodes";
import { ErrorUseCase } from "../../../domain/enums/ErrorUseCase";
import logger from "../../logging/winston/AppLogger";
import { RedisService } from "../../services/redis/RedisService";

interface NonceRequest extends Request {
  nonce?: string;
}

export class NonceValidationMiddleware {
  private static generateRequestSignature(req: Request): string {
    const method = req.method;
    const path = req.path;
    const query = JSON.stringify(req.query || {});
    const body = JSON.stringify(req.body || {});

    const signatureString = `${method}:${path}:${query}:${body}`;
    return crypto.createHash("sha256").update(signatureString).digest("hex");
  }

  static validateNonce() {
    return async (
      req: NonceRequest,
      _res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (process.env.ENABLE_SECURITY_MIDDLEWARES !== "true") {
          return next();
        }

        // Only validate for state-changing requests
        const method = req.method.toLowerCase();
        if (!["get", "post", "put", "patch", "delete"].includes(method)) {
          return next();
        }

        const nonce = (req.headers["x-nonce"] as string) || req.body?.nonce;

        if (!nonce || typeof nonce !== "string") {
          const error = new ApiError(
            "Missing nonce in request",
            ErrorUseCase.NonceValidationError,
            ErrorCode.MissingNonce
          );
          return next(error);
        }

        const trimmedNonce = nonce.trim();

        if (!trimmedNonce) {
          const error = new ApiError(
            "Nonce cannot be empty",
            ErrorUseCase.NonceValidationError,
            ErrorCode.MissingNonce
          );
          return next(error);
        }

        if (!NonceValidationMiddleware.isValidNonceFormat(trimmedNonce)) {
          const error = new ApiError(
            "Invalid nonce format",
            ErrorUseCase.NonceValidationError,
            ErrorCode.InvalidNonceFormat
          );
          return next(error);
        }

        if (NonceValidationMiddleware.isNonceExpired(trimmedNonce)) {
          const error = new ApiError(
            "Nonce has expired",
            ErrorUseCase.NonceValidationError,
            ErrorCode.NonceExpired
          );
          return next(error);
        }

        const clientId = NonceValidationMiddleware.getClientIdentifier(req);
        const requestSignature =
          NonceValidationMiddleware.generateRequestSignature(req);
        const nonceKey = `broadcast:used_nonce:${clientId}:${requestSignature}:${trimmedNonce}`;

        const redisService = container.resolve<RedisService>("RedisService");

        let alreadyUsed = false;
        try {
          const value = await redisService.getValue(nonceKey);
          alreadyUsed = !!value;
        } catch (redisError) {
          logger.error("Redis connection failed during nonce validation:", redisError);
          // Fail open if Redis is down for resilience
          return next();
        }

        if (alreadyUsed) {
          const error = new ApiError(
            "Nonce replay attack detected",
            ErrorUseCase.NonceValidationError,
            ErrorCode.NonceAlreadyUsed
          );
          return next(error);
        }

        try {
          const replayExpire = parseInt(process.env.NONCE_REPLAY_EXPIRE || "300");
          await redisService.setValue(
            nonceKey,
            "used",
            replayExpire
          );
        } catch (redisError) {
          logger.error("Failed to store nonce state:", redisError);
        }

        req.nonce = trimmedNonce;
        next();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nonce validation error";
        const apiError = new ApiError(
          message,
          ErrorUseCase.NonceValidationError,
          ErrorCode.NonceValidationError
        );
        return next(apiError);
      }
    };
  }

  private static isValidNonceFormat(nonce: string): boolean {
    try {
      if (!nonce || typeof nonce !== "string") return false;
      const parts = nonce.split("-");
      if (parts.length < 2) return false;
      const timestampPart = parts[parts.length - 1];
      const timestamp = parseInt(timestampPart, 36);
      if (isNaN(timestamp) || timestamp <= 0) return false;
      return nonce.length >= 20 && nonce.length <= 200;
    } catch (error) {
      return false;
    }
  }

  private static isNonceExpired(nonce: string): boolean {
    try {
      const parts = nonce.split("-");
      const timestampPart = parts[parts.length - 1];
      const nonceTimestamp = parseInt(timestampPart, 36);
      const currentTime = Date.now();
      const maxAge = parseInt(process.env.NONCE_EXPIRE || "300000"); // Default 5 minutes
      return currentTime - nonceTimestamp > maxAge;
    } catch (error) {
      return true;
    }
  }

  private static getClientIdentifier(req: Request): string {
    let ip = req.ip || req.socket?.remoteAddress || "unknown";

    // Normalize loopback addresses for local development consistency
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "127.0.0.1";
    }

    const userAgent = req.headers["user-agent"] || "unknown";
    const userAgentHash = crypto
      .createHash("sha256")
      .update(userAgent)
      .digest("hex")
      .slice(0, 10);
    return `${ip}:${userAgentHash}`;
  }

  /**
   * Clean up expired used nonces
   */
  static async cleanupExpiredNonces(): Promise<void> {
    try {
      const redisService = container.resolve<RedisService>("RedisService");

      const pattern = "broadcast:used_nonce:*";
      const keys = await redisService.scanKeys(pattern);

      if (keys && keys.length > 0) {
        await redisService.deleteKeys(keys);
        logger.info(`[NonceCleanup] Cleaned up ${keys.length} nonces`);
      }
    } catch (error) {
      logger.error("Error cleaning up expired used nonces:", error);
    }
  }
}
