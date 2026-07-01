import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  teamCode: z.string().trim().min(1, "Team code is required."),
  memberEmails: z.array(z.string().trim().email("Each member email must be a valid email address."))
});

export const projectIdParamsSchema = z.object({
  projectId: z.string().trim().min(1, "Project ID is required.")
});

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20)
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
