import type { NextFunction, Request, Response } from "express";

import { createHttpError } from "../../middleware/errorHandler.js";
import { createProjectSchema, projectIdParamsSchema, projectListQuerySchema } from "./projects.schema.js";
import { projectsService } from "./projects.service.js";

export const projectsController = {
  createProject: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw createHttpError(400, "VALIDATION_ERROR", "Invalid project payload.", parsed.error.flatten().fieldErrors);
      }

      if (!req.user) {
        throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
      }

      const project = await projectsService.createProject(parsed.data, req.user.userId);
      res.status(201).json({
        id: project.id,
        title: project.title,
        teamCode: project.teamCode,
        createdAt: project.createdAt
      });
    } catch (error) {
      next(error);
    }
  },

  listProjects: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = projectListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw createHttpError(400, "VALIDATION_ERROR", "Invalid pagination query.", parsed.error.flatten().fieldErrors);
      }

      if (!req.user) {
        throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
      }

      const result = await projectsService.listProjects(req.user.userId, parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getProjectDetail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = projectIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        throw createHttpError(400, "VALIDATION_ERROR", "Invalid project ID.", parsed.error.flatten().fieldErrors);
      }

      if (!req.user) {
        throw createHttpError(401, "UNAUTHORIZED", "Authentication token is required.");
      }

      const project = await projectsService.getProjectDetail(parsed.data.projectId, req.user.userId);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }
};
