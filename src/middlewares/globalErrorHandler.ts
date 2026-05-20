import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import ApiError from '../errors/ApiError';
import { Prisma } from '../generated/client';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: { path: string | number; message: string }[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = [
      {
        path: '',
        message: err.message,
      },
    ];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorMessages = err.issues.map((issue) => ({
      path: String(issue.path[issue.path.length - 1]),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handling Prisma specific known request errors (like P2002 Unique Constraint violation)
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Conflict Error';
      const target = err.meta?.target;
      errorMessages = [
        {
          path: typeof target === 'string' ? target : 'database',
          message: `${target || 'Unique constraint'} already exists.`,
        },
      ];
    } else {
      statusCode = 400;
      message = err.message;
      errorMessages = [
        {
          path: '',
          message: err.message,
        },
      ];
    }
  } else if (err instanceof Error) {
    message = err.message;
    errorMessages = [
      {
        path: '',
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
