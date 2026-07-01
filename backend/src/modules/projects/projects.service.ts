import type { Prisma, Role } from "@prisma/client";

import { createHttpError } from "../../middleware/errorHandler.js";
import { projectsRepository } from "./projects.repository.js";
import type { CreateProjectInput, ProjectDetail, ProjectListItem } from "./projects.types.js";
import type { ProjectListQuery } from "./projects.schema.js";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const toProjectListItem = (project: {
  id: string;
  title: string;
  teamCode: string;
  createdAt: Date;
  adviser: { name: string } | null;
  _count: { members: number };
}): ProjectListItem => ({
  id: project.id,
  title: project.title,
  teamCode: project.teamCode,
  memberCount: project._count.members,
  adviserName: project.adviser?.name ?? null,
  createdAt: project.createdAt
});

const toProjectDetail = (project: {
  id: string;
  title: string;
  teamCode: string;
  createdAt: Date;
  adviser: { name: string; email: string; role: Prisma.JsonValue } | null;
  members: Array<{
    user: { name: string; email: string; role: Prisma.JsonValue };
  }>;
}): ProjectDetail => ({
  id: project.id,
  title: project.title,
  teamCode: project.teamCode,
  members: project.members.map((member) => ({
    name: member.user.name,
    email: member.user.email,
    role: member.user.role as Role | null
  })),
  adviser: project.adviser
    ? {
        name: project.adviser.name,
        email: project.adviser.email,
        role: project.adviser.role as Role | null
      }
    : null,
  artifactSyncStatuses: [],
  createdAt: project.createdAt
});

export const projectsService = {
  createProject: async (input: CreateProjectInput, creatorUserId: string) => {
    const existingProject = await projectsRepository.findProjectByTeamCode(input.teamCode);
    if (existingProject) {
      throw createHttpError(409, "TEAM_CODE_EXISTS", "A project with that team code already exists.");
    }

    const normalizedMemberEmails = Array.from(
      new Set(input.memberEmails.map((email) => normalizeEmail(email)))
    );

    const users = await projectsRepository.findUsersByEmails(normalizedMemberEmails);
    const userIdsByEmail = new Map(users.map((user) => [normalizeEmail(user.email), user.id]));

    // TODO[CONFIRM]: pending-invite behavior is unspecified, so emails without matching users are skipped for now.
    const memberUserIds = normalizedMemberEmails
      .map((email) => userIdsByEmail.get(email))
      .filter((userId): userId is string => Boolean(userId));

    try {
      const project = await projectsRepository.createProjectWithMembers({
        title: input.title.trim(),
        teamCode: input.teamCode.trim(),
        creatorUserId,
        memberUserIds
      });

      return project;
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
        throw createHttpError(409, "TEAM_CODE_EXISTS", "A project with that team code already exists.");
      }

      throw error;
    }
  },

  listProjects: async (userId: string, query: ProjectListQuery) => {
    const skip = (query.page - 1) * query.pageSize;
    const [projects, total] = await Promise.all([
      projectsRepository.findProjectsForMember(userId, skip, query.pageSize),
      projectsRepository.countProjectsForMember(userId)
    ]);

    return {
      items: projects.map(toProjectListItem),
      page: query.page,
      pageSize: query.pageSize,
      total
    };
  },

  getProjectDetail: async (projectId: string, userId: string) => {
    const membership = await projectsRepository.isMemberOfProject(projectId, userId);
    if (!membership) {
      const project = await projectsRepository.findProjectDetailById(projectId);
      if (!project) {
        throw createHttpError(404, "PROJECT_NOT_FOUND", "Project not found.");
      }

      throw createHttpError(403, "FORBIDDEN", "You are not a member of this project.");
    }

    const project = await projectsRepository.findProjectDetailById(projectId);
    if (!project) {
      throw createHttpError(404, "PROJECT_NOT_FOUND", "Project not found.");
    }

    return toProjectDetail(project);
  }
};
