import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');

export const projectIdParamsSchema = z.object({
  projectId: objectIdSchema,
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required.').max(120),
  sceneBrief: z.string().trim().max(4000).optional(),
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required.',
  });

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>;
