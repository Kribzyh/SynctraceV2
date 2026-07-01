import type { Prisma } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export const projectsRepository = {
  findProjectByTeamCode: (teamCode: string) =>
    prisma.project.findUnique({ where: { teamCode } }),

  createProjectWithMembers: async (input: {
    title: string;
    teamCode: string;
    creatorUserId: string;
    memberUserIds: string[];
  }) => {
    return prisma.$transaction(async (transaction) => {
      const project = await transaction.project.create({
        data: {
          title: input.title,
          teamCode: input.teamCode
        }
      });

      const uniqueMemberIds = Array.from(new Set([input.creatorUserId, ...input.memberUserIds]));

      for (const userId of uniqueMemberIds) {
        try {
          await transaction.projectMember.create({
            data: {
              projectId: project.id,
              userId
            }
          });
        } catch (error) {
          if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2002") {
            continue;
          }

          throw error;
        }
      }

      await transaction.auditLog.create({
        data: {
          userId: input.creatorUserId,
          action: "CREATE_PROJECT",
          metadata: {
            projectId: project.id,
            teamCode: input.teamCode,
            title: input.title
          } as Prisma.InputJsonValue
        }
      });

      return project;
    });
  },

  findProjectsForMember: (userId: string, skip: number, take: number) =>
    prisma.project.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take,
      include: {
        adviser: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    }),

  countProjectsForMember: (userId: string) =>
    prisma.project.count({
      where: {
        members: {
          some: {
            userId
          }
        }
      }
    }),

  findProjectDetailById: (projectId: string) =>
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        adviser: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    }),

  isMemberOfProject: (projectId: string, userId: string) =>
    prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    }),

  findUsersByEmails: (emails: string[]) =>
    prisma.user.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        id: true,
        email: true
      }
    })
};
