import { z } from 'zod';

const optionalIsoDate = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional();

export const taskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'done',
  'missed',
]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).nullable().optional(),
  deadline: optionalIsoDate,
  estimatedMinutes: z.number().int().positive().max(1440).nullable().optional(),
  priority: z.string().trim().max(31).nullable().optional(),
  status: taskStatusSchema.optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided.'
  );

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
