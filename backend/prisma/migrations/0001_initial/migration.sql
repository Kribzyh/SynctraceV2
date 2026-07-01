-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADVISER');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('PROPOSAL', 'SRS', 'SDD', 'SPMP', 'STD', 'SOURCE_CODE');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('READY', 'NEEDS_REVISION', 'CRITICAL_GAPS');

-- CreateEnum
CREATE TYPE "GapSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ArtifactPair" AS ENUM ('PROPOSAL_TO_SRS', 'SRS_TO_SDD', 'SRS_TO_SPMP', 'SRS_TO_STD', 'SDD_TO_SOURCE_CODE');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'JSON', 'CSV');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pictureUrl" TEXT,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teamCode" TEXT NOT NULL,
    "adviserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "lastSyncedAt" TIMESTAMP(3),
    "rawStorageKey" TEXT,
    "smartGoals" JSONB,
    "evaluation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifact_chunks" (
    "id" TEXT NOT NULL,
    "artifact_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sectionPath" TEXT,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artifact_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraceabilityLink" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pair" "ArtifactPair" NOT NULL,
    "sourceChunkId" TEXT NOT NULL,
    "targetChunkId" TEXT NOT NULL,
    "alignmentScore" DOUBLE PRECISION NOT NULL,
    "coveragePercent" DOUBLE PRECISION,
    "auditResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraceabilityLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gap" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pair" "ArtifactPair" NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "GapSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "affectedSections" JSONB,
    "auditResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticRecommendation" (
    "id" TEXT NOT NULL,
    "gapId" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "codeRecommendation" TEXT,
    "priority" "GapSeverity" NOT NULL,
    "aiConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceCodeAlignmentResult" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "designComponent" TEXT NOT NULL,
    "matchedSymbol" TEXT,
    "status" TEXT NOT NULL,
    "evidenceFilePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceCodeAlignmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagramRecommendation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "diagramType" TEXT NOT NULL,
    "mermaidCode" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "sourceGapId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditResult" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "readinessStatus" "ReadinessStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "auditResultId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "fileStorageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_teamCode_key" ON "Project"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_projectId_type_key" ON "Artifact"("projectId", "type");

-- CreateIndex
CREATE INDEX "artifact_chunks_artifact_id_idx" ON "artifact_chunks"("artifact_id");

-- CreateIndex
CREATE INDEX "TraceabilityLink_projectId_pair_idx" ON "TraceabilityLink"("projectId", "pair");

-- CreateIndex
CREATE INDEX "Gap_projectId_pair_idx" ON "Gap"("projectId", "pair");

-- CreateIndex
CREATE INDEX "Gap_projectId_severity_idx" ON "Gap"("projectId", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticRecommendation_gapId_key" ON "DiagnosticRecommendation"("gapId");

-- CreateIndex
CREATE INDEX "SourceCodeAlignmentResult_projectId_idx" ON "SourceCodeAlignmentResult"("projectId");

-- CreateIndex
CREATE INDEX "DiagramRecommendation_projectId_idx" ON "DiagramRecommendation"("projectId");

-- CreateIndex
CREATE INDEX "AuditResult_projectId_createdAt_idx" ON "AuditResult"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ExportJob_requestedById_idx" ON "ExportJob"("requestedById");

-- CreateIndex
CREATE INDEX "ExportJob_auditResultId_idx" ON "ExportJob"("auditResultId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_adviserId_fkey" FOREIGN KEY ("adviserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifact_chunks" ADD CONSTRAINT "artifact_chunks_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraceabilityLink" ADD CONSTRAINT "TraceabilityLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraceabilityLink" ADD CONSTRAINT "TraceabilityLink_auditResultId_fkey" FOREIGN KEY ("auditResultId") REFERENCES "AuditResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gap" ADD CONSTRAINT "Gap_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gap" ADD CONSTRAINT "Gap_auditResultId_fkey" FOREIGN KEY ("auditResultId") REFERENCES "AuditResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticRecommendation" ADD CONSTRAINT "DiagnosticRecommendation_gapId_fkey" FOREIGN KEY ("gapId") REFERENCES "Gap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceCodeAlignmentResult" ADD CONSTRAINT "SourceCodeAlignmentResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagramRecommendation" ADD CONSTRAINT "DiagramRecommendation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditResult" ADD CONSTRAINT "AuditResult_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_auditResultId_fkey" FOREIGN KEY ("auditResultId") REFERENCES "AuditResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;