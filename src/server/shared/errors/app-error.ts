export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = "BAD_REQUEST", details?: unknown) {
    super(message, code, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED", details?: unknown) {
    super(message, code, 401, details);
  }
}

export class PaymentRequiredError extends AppError {
  constructor(
    message = "Payment Required",
    code = "PAYMENT_REQUIRED",
    details?: unknown
  ) {
    super(message, code, 402, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN", details?: unknown) {
    super(message, code, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND", details?: unknown) {
    super(message, code, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT", details?: unknown) {
    super(message, code, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", code = "VALIDATION_ERROR", details?: unknown) {
    super(message, code, 422, details);
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, code = "BLOCKCHAIN_ERROR", details?: unknown) {
    super(message, code, 502, details);
  }
}
