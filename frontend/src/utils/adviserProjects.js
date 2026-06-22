import {
  analysisSnapshot,
  components,
  computeTraceabilityScore,
  mappingResult,
  runTraceabilityMapping,
} from './traceability.js'

export const ADVISER_STORAGE_KEYS = {
  selectedProject: 'synctrace-adviser-selected-project',
  evaluations: 'synctrace-adviser-evaluations',
}

export const assignedProjects = [
  {
    id: 'team-16',
    teamCode: '16',
    title: 'SyncTrace — AI Academic Traceability Platform',
    course: 'IT411 — Capstone 2',
    semester: '2526 Sem 2',
    members: [
      { name: 'Jumawan, Clyde Nixon', role: 'Leader' },
      { name: 'Dela Cruz, Maria', role: 'Member' },
      { name: 'Reyes, James', role: 'Member' },
    ],
    smartGoals: [
      'GO1 — Secure user authentication via institutional Google accounts',
      'GO2 — Role-based onboarding for students and advisers',
      'GO3 — IEEE document registry with version tracking',
      'GO4 — AI-powered traceability gap detection',
      'GO5 — Component-level coverage visualization',
      'GO6 — Downloadable audit and traceability reports',
    ],
    artifactsUploaded: 6,
    artifactsTotal: 6,
    traceabilityScore: analysisSnapshot.traceabilityScore,
    gapCount: mappingResult.stats.gapCount,
    continuityStatus: analysisSnapshot.continuityStatus,
    reviewStatus: 'pending',
    lastSubmitted: 'May 26, 2026',
    components,
    mappingResult,
  },
  {
    id: 'team-12',
    teamCode: '12',
    title: 'Campus E-Library Management System',
    course: 'IT411 — Capstone 2',
    semester: '2526 Sem 2',
    members: [
      { name: 'Tan, Patricia', role: 'Leader' },
      { name: 'Go, Michael', role: 'Member' },
    ],
    smartGoals: [
      'GO1 — Digital catalog with ISBN search',
      'GO2 — Borrowing and return workflow',
      'GO3 — Admin reporting dashboard',
    ],
    artifactsUploaded: 6,
    artifactsTotal: 6,
    traceabilityScore: 85,
    gapCount: 4,
    continuityStatus: 'verified',
    reviewStatus: 'approved',
    lastSubmitted: 'May 20, 2026',
    components: null,
    mappingResult: null,
  },
  {
    id: 'team-08',
    teamCode: '08',
    title: 'IoT Health Monitoring Wearable',
    course: 'IT411 — Capstone 2',
    semester: '2526 Sem 2',
    members: [
      { name: 'Lim, Angela', role: 'Leader' },
      { name: 'Santos, Carlo', role: 'Member' },
      { name: 'Villanueva, Nina', role: 'Member' },
      { name: 'Ong, Kevin', role: 'Member' },
    ],
    smartGoals: [
      'GO1 — Real-time heart rate monitoring',
      'GO2 — Emergency alert to guardians',
      'GO3 — Mobile companion app sync',
    ],
    artifactsUploaded: 4,
    artifactsTotal: 6,
    traceabilityScore: 45,
    gapCount: 22,
    continuityStatus: 'broken',
    reviewStatus: 'needs_revision',
    lastSubmitted: 'May 18, 2026',
    components: null,
    mappingResult: null,
  },
  {
    id: 'team-22',
    teamCode: '22',
    title: 'Campus Navigation & Wayfinding App',
    course: 'IT411 — Capstone 2',
    semester: '2526 Sem 2',
    members: [
      { name: 'Bautista, Eric', role: 'Leader' },
      { name: 'Fernandez, Leah', role: 'Member' },
    ],
    smartGoals: [
      'GO1 — Indoor map rendering',
      'GO2 — Turn-by-turn navigation',
      'GO3 — Accessibility routes',
    ],
    artifactsUploaded: 5,
    artifactsTotal: 6,
    traceabilityScore: 62,
    gapCount: 11,
    continuityStatus: 'partial',
    reviewStatus: 'pending',
    lastSubmitted: 'May 24, 2026',
    components: null,
    mappingResult: null,
  },
]

const reviewStatusMeta = {
  pending: { label: 'Pending Review', tone: 'amber' },
  approved: { label: 'Approved', tone: 'green' },
  needs_revision: { label: 'Needs Revision', tone: 'red' },
}

export function getReviewStatusMeta(status) {
  return reviewStatusMeta[status] ?? reviewStatusMeta.pending
}

export function getAssignedProject(id) {
  return assignedProjects.find((project) => project.id === id) ?? null
}

export function getSelectedProjectId() {
  return localStorage.getItem(ADVISER_STORAGE_KEYS.selectedProject) ?? assignedProjects[0].id
}

export function setSelectedProjectId(id) {
  localStorage.setItem(ADVISER_STORAGE_KEYS.selectedProject, id)
}

export function getSelectedProject() {
  return getAssignedProject(getSelectedProjectId())
}

export function getProjectTraceData(project) {
  if (project.components) {
    return {
      components: project.components,
      mappingResult: project.mappingResult ?? runTraceabilityMapping(project.components),
      traceabilityScore: project.traceabilityScore ?? computeTraceabilityScore(project.components),
    }
  }

  const syntheticGaps = Array.from({ length: project.gapCount }, (_, index) => ({
    id: index + 1,
    type: ['sdd-mapping', 'test-case', 'implementation', 'planning-trace'][index % 4],
    severity: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
    title: `Gap ${index + 1} — ${project.title}`,
    from: 'SRS',
    to: 'SDD',
    component: `Module ${index + 1}`,
    description: 'Synthetic gap for demo project review.',
    fix: 'Update artifacts and re-run analysis.',
  }))

  return {
    components: [],
    mappingResult: { gaps: syntheticGaps, stats: { gapCount: project.gapCount } },
    traceabilityScore: project.traceabilityScore,
  }
}

export function getAdviserDashboardStats() {
  const pending = assignedProjects.filter((p) => p.reviewStatus === 'pending').length
  const highestGaps = [...assignedProjects].sort((a, b) => b.gapCount - a.gapCount).slice(0, 3)
  const lowestScores = [...assignedProjects].sort((a, b) => a.traceabilityScore - b.traceabilityScore).slice(0, 3)

  return { pending, highestGaps, lowestScores }
}
