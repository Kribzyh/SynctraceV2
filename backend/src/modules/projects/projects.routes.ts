import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { projectsController } from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.use(authenticate);
projectsRouter.post("/", projectsController.createProject);
projectsRouter.get("/", projectsController.listProjects);
projectsRouter.get("/:projectId", projectsController.getProjectDetail);
