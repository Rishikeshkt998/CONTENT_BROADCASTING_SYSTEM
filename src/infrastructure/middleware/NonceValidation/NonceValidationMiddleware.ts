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

        const nonce = (req.headers["x-nonce"] as string) || req.body?.nonce;

        if (!nonce || typeof nonce !== "string") {
          return next(new ApiError("Missing nonce in request", ErrorUseCase.NonceValidationError, ErrorCode.MissingNonce));
        }

        const trimmedNonce = nonce.trim();
        if (!trimmedNonce) {
          return next(new ApiError("Nonce cannot be empty", ErrorUseCase.NonceValidationError, ErrorCode.MissingNonce));
        }

        if (!this.isValidNonceFormat(trimmedNonce)) {
          return next(new ApiError("Invalid nonce format", ErrorUseCase.NonceValidationError, ErrorCode.InvalidNonceFormat));
        }

        if (this.isNonceExpired(trimmedNonce)) {
          return next(new ApiError("Nonce has expired", ErrorUseCase.NonceValidationError, ErrorCode.NonceExpired));
        }

        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const userAgent = req.headers["user-agent"] || "unknown";
        const userAgentHash = crypto.createHash("sha256").update(userAgent).digest("hex").slice(0, 10);
        const clientId = `${ip}:${userAgentHash}`;
        
        const requestSignature = this.generateRequestSignature(req);
        const nonceKey = `broadcast:used_nonce:${clientId}:${requestSignature}:${trimmedNonce}`;

        const redisService = container.resolve<RedisService>("RedisService");
        
        try {
          const alreadyUsed = await redisService.getValue(nonceKey);
          if (alreadyUsed) {
            return next(new ApiError("Nonce replay attack detected", ErrorUseCase.NonceValidationError, ErrorCode.NonceAlreadyUsed));
          }
          
          await redisService.setValue(nonceKey, "used", 300); // 5 minutes
        } catch (redisError) {
          logger.error("Redis connection failed during nonce validation:", redisError);
          // Fail open if Redis is down for resilience
          return next();
        }

        req.nonce = trimmedNonce;
        next();
      } catch (error) {
        next(new ApiError("Nonce validation error", ErrorUseCase.NonceValidationError, ErrorCode.NonceValidationError));
      }
    };
  }

  private static isValidNonceFormat(nonce: string): boolean {
    const parts = nonce.split("-");
    if (parts.length < 2) return false;
    const timestampPart = parts[parts.length - 1];
    const timestamp = parseInt(timestampPart, 36);
    return !isNaN(timestamp) && timestamp > 0;
  }

  private static isNonceExpired(nonce: string): boolean {
    const parts = nonce.split("-");
    const timestampPart = parts[parts.length - 1];
    const nonceTimestamp = parseInt(timestampPart, 36);
    const currentTime = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return currentTime - nonceTimestamp > maxAge;
  }
}
