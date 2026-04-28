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
  MissingNonce = 400,
  InvalidNonceFormat = 400,
  NonceExpired = 401,
  NonceAlreadyUsed = 403,
  NonceValidationError = 400,
}

export default ErrorCode;
