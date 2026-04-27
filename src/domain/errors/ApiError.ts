import ErrorCode from "../enums/ErrorCodes";
import { ErrorUseCase } from "../enums/ErrorUseCase";

export class ApiError extends Error {
  public code: ErrorCode;
  public useCase: ErrorUseCase;
  public errorCode?: any;

  constructor(
    message: string,
    useCase: ErrorUseCase,
    code: ErrorCode,
    errorCode?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.useCase = useCase;
    this.code = code;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
