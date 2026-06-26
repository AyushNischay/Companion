import { ZodError } from 'zod';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function jsonResponse<T>(body: T, init?: ResponseInit) {
  return Response.json(body, init);
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
) {
  return jsonResponse<ApiErrorBody>(
    {
      error: {
        code,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse(
    'VALIDATION_ERROR',
    'Request validation failed.',
    400,
    error.flatten()
  );
}

export function getCurrentUserId(request: Request) {
  const userId = request.headers.get('x-user-id')?.trim();

  if (!userId) {
    return null;
  }

  return userId;
}
