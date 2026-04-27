export enum ErrorUseCase {
  RateLimitingError = "RATE_LIMITING_ERROR",
  NonceValidationError = "NONCE_VALIDATION_ERROR",
  SecurityError = "SECURITY_ERROR",
  UploadError = "UPLOAD_ERROR",
  DatabaseError = "DATABASE_ERROR",
  AuthenticationError = "AUTHENTICATION_ERROR",
}
