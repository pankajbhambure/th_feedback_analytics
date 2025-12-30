import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message = 'Error',
  statusCode = 500,
  errors?: unknown
): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
};

export const createdResponse = <T>(res: Response, data: T, message = 'Created'): void => {
  successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response): void => {
  res.status(204).send();
};
