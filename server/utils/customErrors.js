class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = []) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errors = []) {
    super(message, 401, errors);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errors = []) {
    super(message, 403, errors);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found', errors = []) {
    super(message, 404, errors);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict', errors = []) {
    super(message, 409, errors);
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', errors = []) {
    super(message, 500, errors);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError
};
