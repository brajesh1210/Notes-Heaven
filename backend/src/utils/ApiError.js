export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (m = 'Invalid request', errors = []) => new ApiError(400, m, errors);
export const unauthorized = (m = 'Not authorized, please login') => new ApiError(401, m);
export const forbidden = (m = 'You are not allowed to perform this action') => new ApiError(403, m);
export const notFound = (m = 'Resource not found') => new ApiError(404, m);
export const conflict = (m = 'Resource already exists') => new ApiError(409, m);
export const tooMany = (m = 'Too many requests, please slow down and try again') => new ApiError(429, m);
