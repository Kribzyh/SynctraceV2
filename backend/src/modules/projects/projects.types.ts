import type { Role } from "@prisma/client";

export interface CreateProjectInput {
  title: string;
  teamCode: string;
  memberEmails: string[];
}

export interface ProjectListItem {
  id: string;
  title: string;
  teamCode: string;
  memberCount: number;
  adviserName: string | null;
  createdAt: Date;
}

export interface ProjectMemberDetail {
  name: string;
  email: string;
  role: Role | null;
}

export interface ProjectDetail {
  id: string;
  title: string;
  teamCode: string;
  members: ProjectMemberDetail[];
  adviser: ProjectMemberDetail | null;
  artifactSyncStatuses: Array<Record<string, never>>;
  createdAt: Date;
}
