import { ZodError } from 'zod';
import {
  createTaskSchema,
  listTasksQuerySchema,
} from '@/features/tasks/schemas';
import { createTask, listTasks } from '@/features/tasks/task-service';
import {
  errorResponse,
  getCurrentUserId,
  jsonResponse,
  validationErrorResponse,
} from '@/lib/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = getCurrentUserId(request);

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Missing x-user-id header.', 401);
  }

  const url = new URL(request.url);
  const query = listTasksQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
  });

  if (!query.success) {
    return validationErrorResponse(query.error);
  }

  const tasks = await listTasks(userId, query.data.status);

  return jsonResponse({ tasks });
}

export async function POST(request: Request) {
  const userId = getCurrentUserId(request);

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Missing x-user-id header.', 401);
  }

  try {
    const body = await request.json();
    const input = createTaskSchema.parse(body);
    const task = await createTask(userId, input);

    return jsonResponse({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    if (error instanceof SyntaxError) {
      return errorResponse(
        'INVALID_JSON',
        'Request body must be valid JSON.',
        400
      );
    }

    throw error;
  }
}
