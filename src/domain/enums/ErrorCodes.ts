enum ErrorCode {
  PayloadError = 12,
  NotFound = 404,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  InternalError = 500,
  NotAllowed = 405,
  Conflict = 409,
  RateLimitExceeded = 429,
  MissingNonce = 4001,
  InvalidNonceFormat = 4002,
  NonceExpired = 4003,
  NonceAlreadyUsed = 4004,
  NonceValidationError = 4005,
}

export default ErrorCode;
