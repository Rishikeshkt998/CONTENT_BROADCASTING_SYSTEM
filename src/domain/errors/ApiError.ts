import ErrorCode from "../enums/ErrorCodes";
import { ErrorUseCase } from "../enums/ErrorUseCase";

export class ApiError extends Error {
  public code: ErrorCode;
  public useCase: ErrorUseCase;
  public errorDetails?: any;

  constructor(
    message: string,
    useCase: ErrorUseCase,
    code: ErrorCode,
    errorDetails?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.useCase = useCase;
    this.code = code;
    this.errorDetails = errorDetails;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
