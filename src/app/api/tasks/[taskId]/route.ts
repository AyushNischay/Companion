import { ZodError } from 'zod';
import { updateTaskSchema } from '@/features/tasks/schemas';
import { deleteTask, getTask, updateTask } from '@/features/tasks/task-service';
import {
  errorResponse,
  getCurrentUserId,
  jsonResponse,
  validationErrorResponse,
} from '@/lib/api';

export const runtime = 'nodejs';

type TaskRouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(request: Request, context: TaskRouteContext) {
  const userId = getCurrentUserId(request);

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Missing x-user-id header.', 401);
  }

  const { taskId } = await context.params;
  const task = await getTask(userId, taskId);

  if (!task) {
    return errorResponse('NOT_FOUND', 'Task not found.', 404);
  }

  return jsonResponse({ task });
}

export async function PATCH(request: Request, context: TaskRouteContext) {
  const userId = getCurrentUserId(request);

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Missing x-user-id header.', 401);
  }

  try {
    const body = await request.json();
    const input = updateTaskSchema.parse(body);
    const { taskId } = await context.params;
    const task = await updateTask(userId, taskId, input);

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found.', 404);
    }

    return jsonResponse({ task });
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

export async function DELETE(request: Request, context: TaskRouteContext) {
  const userId = getCurrentUserId(request);

  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Missing x-user-id header.', 401);
  }

  const { taskId } = await context.params;
  const task = await deleteTask(userId, taskId);

  if (!task) {
    return errorResponse('NOT_FOUND', 'Task not found.', 404);
  }

  return jsonResponse({ task });
}
