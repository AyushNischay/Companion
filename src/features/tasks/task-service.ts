import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import type { CreateTaskInput, UpdateTaskInput } from './schemas';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  deadline: true,
  estimatedMinutes: true,
  source: true,
  status: true,
  priority: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.TaskSelect;

function normalizeDeadline(deadline: string | null | undefined) {
  if (deadline === undefined) {
    return undefined;
  }

  return deadline === null ? null : new Date(deadline);
}

export async function listTasks(userId: string, status?: string) {
  return prisma.task.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    select: taskSelect,
  });
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      deadline: normalizeDeadline(input.deadline),
      estimatedMinutes: input.estimatedMinutes,
      priority: input.priority,
      status: input.status ?? 'pending',
    },
    select: taskSelect,
  });
}

export async function getTask(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      deletedAt: null,
    },
    select: taskSelect,
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  const existingTask = await getTask(userId, taskId);

  if (!existingTask) {
    return null;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.deadline === undefined
        ? {}
        : { deadline: normalizeDeadline(input.deadline) }),
      ...(input.estimatedMinutes === undefined
        ? {}
        : { estimatedMinutes: input.estimatedMinutes }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      ...(input.status === undefined ? {} : { status: input.status }),
    },
    select: taskSelect,
  });
}

export async function deleteTask(userId: string, taskId: string) {
  const existingTask = await getTask(userId, taskId);

  if (!existingTask) {
    return null;
  }

  return prisma.task.update({
    where: { id: taskId },
    data: {
      deletedAt: new Date(),
    },
    select: taskSelect,
  });
}
