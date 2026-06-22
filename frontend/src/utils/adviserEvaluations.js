import { ADVISER_STORAGE_KEYS } from './adviserProjects.js'

const defaultEvaluation = {
  projectScore: null,
  approvalStatus: 'pending',
  overallComments: '',
  recommendations: '',
  componentRemarks: {},
}

const seededEvaluations = {
  'team-16': {
    projectScore: 78,
    approvalStatus: 'pending',
    overallComments:
      'The SyncTrace project demonstrates strong IEEE artifact coverage with well-defined SMART goals flowing from Proposal through SRS. Component-level traceability is partially established, but several SDD-to-implementation links require verification before defense readiness.',
    recommendations:
      '1. Complete missing STD test cases for Authentication and Gap Analysis modules.\n2. Align SPMP milestone dates with SDD delivery phases.\n3. Re-run AI extraction after uploading revised SDD diagrams.',
    componentRemarks: {
      login: 'SRS requirement REQ-AUTH-01 is traced; verify OAuth implementation evidence in source code.',
      registration: 'Partial trace — SDD module exists but STD coverage is incomplete.',
      'gap-analysis': 'Strong SRS and STD linkage; ensure SPMP milestone reflects AI audit deliverable.',
    },
  },
  'team-12': {
    projectScore: 85,
    approvalStatus: 'approved',
    overallComments:
      'E-Library project shows consistent traceability across all major artifacts. Minor gaps in test documentation do not block approval.',
    recommendations: 'Update STD appendix references to match latest SRS revision.',
    componentRemarks: {},
  },
}

export function loadEvaluation(projectId) {
  try {
    const raw = localStorage.getItem(ADVISER_STORAGE_KEYS.evaluations)
    const all = raw ? JSON.parse(raw) : {}
    const saved = all[projectId] ?? {}
    const seeded = seededEvaluations[projectId] ?? {}
    return { ...defaultEvaluation, ...seeded, ...saved }
  } catch {
    return { ...defaultEvaluation, ...(seededEvaluations[projectId] ?? {}) }
  }
}

export function saveEvaluation(projectId, evaluation) {
  try {
    const raw = localStorage.getItem(ADVISER_STORAGE_KEYS.evaluations)
    const all = raw ? JSON.parse(raw) : {}
    all[projectId] = evaluation
    localStorage.setItem(ADVISER_STORAGE_KEYS.evaluations, JSON.stringify(all))
  } catch {
    // ignore storage errors in demo
  }
}

export const approvalOptions = [
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'needs_revision', label: 'Needs Revision' },
]

function buildAiSummary(project, trace) {
  const gapCount = trace.mappingResult.stats?.gapCount ?? project.gapCount
  const score = project.traceabilityScore
  const continuity = project.continuityStatus

  if (score >= 80 && gapCount <= 5) {
    return `AI analysis indicates strong traceability (${score}%) with ${gapCount} minor gaps. Lifecycle continuity is ${continuity}. The team is approaching defense readiness with focused revisions recommended.`
  }
  if (score >= 60) {
    return `AI analysis detected partial traceability (${score}%) with ${gapCount} gaps across the lifecycle chain. Continuity status: ${continuity}. Several artifact links need strengthening before final adviser approval.`
  }
  return `AI analysis flagged significant traceability concerns (${score}%) with ${gapCount} gaps. Continuity is ${continuity}. Immediate remediation of missing SRS→SDD→STD→Code links is required.`
}

export function buildEvaluationReport(project, trace, evaluation) {
  const gaps = trace.mappingResult.gaps ?? []
  const components = trace.components ?? []
  const score = evaluation.projectScore ?? project.traceabilityScore

  return {
    generatedAt: project.lastSubmitted,
    teamCode: project.teamCode,
    projectTitle: project.title,
    section: project.section,
    overallScore: score,
    traceabilityScore: project.traceabilityScore,
    gapCount: trace.mappingResult.stats?.gapCount ?? project.gapCount,
    artifactsUploaded: project.artifactsUploaded,
    artifactsTotal: project.artifactsTotal,
    continuityStatus: project.continuityStatus,
    approvalStatus: evaluation.approvalStatus || project.reviewStatus,
    aiSummary: evaluation.overallComments || buildAiSummary(project, trace),
    recommendations: evaluation.recommendations || 'No adviser recommendations recorded yet.',
    componentRemarks: evaluation.componentRemarks,
    components,
    topGaps: gaps.slice(0, 5),
    fullyTracedComponents: components.filter((c) =>
      Object.values(c.mapping ?? {}).filter(Boolean).length >= 4,
    ).length,
  }
}
