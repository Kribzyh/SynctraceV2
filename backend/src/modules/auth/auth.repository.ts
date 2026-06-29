import type { Prisma, Role } from "@prisma/client";

import { prisma } from "../../config/prisma.js";

export const authRepository = {
  findUserByGoogleId: (googleId: string) =>
    prisma.user.findUnique({ where: { googleId } }),

  findUserByIdWithMemberships: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectMemberships: true
      }
    }),

  createUser: (input: {
    googleId: string;
    email: string;
    name: string;
    pictureUrl: string | null;
  }) =>
    prisma.user.create({
      data: {
        googleId: input.googleId,
        email: input.email,
        name: input.name,
        pictureUrl: input.pictureUrl
      }
    }),

  completeProfile: (userId: string, role: Role) =>
    prisma.user.update({
      where: { id: userId },
      data: { role }
    }),

  createLoginAuditLog: (userId: string, metadata: Record<string, unknown>) =>
    prisma.auditLog.create({
      data: {
        userId,
        action: "LOGIN",
        metadata: metadata as Prisma.InputJsonValue
      }
    })
};