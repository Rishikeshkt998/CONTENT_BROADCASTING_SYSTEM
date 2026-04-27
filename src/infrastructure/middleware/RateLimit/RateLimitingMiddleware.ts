
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { ApiError } from "../../../domain/errors/ApiError";
import ErrorCode from "../../../domain/enums/ErrorCodes";
import { ErrorUseCase } from "../../../domain/enums/ErrorUseCase";

export class RateLimitingMiddleware {
  private static generateRequestSignature(req: Request): string {
    const method = req.method;
    const path = req.path;
    const query = JSON.stringify(req.query || {});
    const body = JSON.stringify(req.body || {});

    const signatureString = `${method}:${path}:${query}:${body}`;
    return crypto.createHash("sha256").update(signatureString).digest("hex");
  }

  private static keyGenerator = (req: Request): string => {
    const rawIp = req.ip || req.socket?.remoteAddress || "unknown";
    const ip = ipKeyGenerator(rawIp);

    const userAgent = req.headers["user-agent"] || "unknown";
    const userAgentHash = crypto
      .createHash("sha256")
      .update(userAgent)
      .digest("hex")
      .slice(0, 10);
    const requestSignature = RateLimitingMiddleware.generateRequestSignature(req);

    return `${ip}:${userAgentHash}:${requestSignature}`;
  };

  private static getWindowMs(envVar: string, defaultMinutes: number): number {
    const minutes = parseInt(process.env[envVar] || defaultMinutes.toString());
    return minutes * 60 * 1000;
  }

  private static getMaxRequests(envVar: string, defaultMax: number): number {
    return parseInt(process.env[envVar] || defaultMax.toString());
  }

  static generalRateLimit = rateLimit({
    windowMs: RateLimitingMiddleware.getWindowMs(
      "RATE_LIMIT_WINDOW_MINUTES",
      15
    ),
    max: RateLimitingMiddleware.getMaxRequests("RATE_LIMIT_MAX_REQUESTS", 100),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: RateLimitingMiddleware.keyGenerator,
    handler: (_req: Request, res: Response, next: NextFunction) => {
      if (!res.headersSent) {
        const error = new ApiError(
          "Too many requests. Please try again later.",
          ErrorUseCase.RateLimitingError,
          ErrorCode.RateLimitExceeded
        );
        return next(error);
      }
    },
  });
}
