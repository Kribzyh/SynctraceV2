import { loadArtifacts } from './artifacts.js'
import { resolveLifecycleCode, resolveLifecycleDocument } from './documentViewer.js'
import { runTraceabilityMapping, buildComponentEvaluationReport } from './traceabilityEngine.js'

export const artifactColumns = [
  { key: 'proposal', label: 'Proposal' },
  { key: 'srs', label: 'SRS' },
  { key: 'sdd', label: 'SDD' },
  { key: 'spmp', label: 'SPMP' },
  { key: 'std', label: 'STD' },
  { key: 'code', label: 'Code' },
]

/** Weights reflect IEEE lifecycle importance per artifact type (sum = 1.0). */
export const artifactWeights = {
  proposal: 0.1,
  srs: 0.25,
  sdd: 0.25,
  spmp: 0.1,
  std: 0.15,
  code: 0.15,
}

export const traceabilityScoreDescription =
  'The traceability score is computed based on component-level lifecycle coverage across IEEE artifacts. Each component is evaluated across Proposal, SRS, SDD, SPMP, STD, and Source Code with weighted scoring. Missing or incomplete mappings reduce the final score to reflect continuity gaps.'

export const components = [
  {
    id: 'login',
    name: 'Login',
    smartGoal: 'GO1 — Secure user authentication via institutional Google accounts',
    mapping: { proposal: true, srs: true, sdd: true, spmp: true, std: true, code: true },
    lifecycle: {
      proposal: { ref: '§2.1 Authentication Goals', status: 'linked' },
      srs: { ref: 'FR-AUTH-01, NFR-SEC-02', status: 'linked' },
      diagrams: {
        ref: 'Image 20 — Use Case Diagram',
        status: 'linked',
        documentRef: { artifactId: 'srs', page: 20, totalPages: 65, imageLabel: 'Image 20' },
      },
      wireframes: {
        ref: 'WF-AUTH-01 Login Screen',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 12, totalPages: 48, imageLabel: 'WF-AUTH-01' },
      },
      modules: { ref: 'SDD Module 3.1 — AuthController', status: 'linked' },
      testCases: { ref: 'TC-AUTH-01 to TC-AUTH-05', status: 'linked' },
      sourceCode: {
        ref: 'src/pages/Login.jsx',
        status: 'linked',
        codeRef: { filePath: 'src/pages/Login.jsx', label: 'Login.jsx' },
      },
      evidence: {
        ref: 'OAuth flow screenshot',
        status: 'linked',
        documentRef: { artifactId: 'std', page: 8, totalPages: 42, imageLabel: 'TC-AUTH Evidence' },
      },
    },
  },
  {
    id: 'registration',
    name: 'User Registration',
    smartGoal: 'GO2 — Role-based onboarding for students and advisers',
    mapping: { proposal: true, srs: true, sdd: true, spmp: false, std: true, code: true },
    lifecycle: {
      proposal: { ref: '§2.2 User Onboarding', status: 'linked' },
      srs: { ref: 'FR-REG-01', status: 'linked' },
      diagrams: {
        ref: 'Image 14 — Registration Flow',
        status: 'linked',
        documentRef: { artifactId: 'srs', page: 14, totalPages: 65, imageLabel: 'Image 14' },
      },
      wireframes: {
        ref: 'WF-REG-01 Sign Up Screen',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 14, totalPages: 48, imageLabel: 'WF-REG-01' },
      },
      modules: { ref: 'SDD Module 3.2 — SignUp Flow', status: 'linked' },
      testCases: { ref: 'TC-REG-01, TC-REG-02', status: 'linked' },
      sourceCode: {
        ref: 'src/pages/SignUp.jsx',
        status: 'linked',
        codeRef: { filePath: 'src/pages/SignUp.jsx', label: 'SignUp.jsx' },
      },
      evidence: { ref: 'Role selection demo', status: 'missing' },
    },
  },
  {
    id: 'artifact-upload',
    name: 'Artifact Upload',
    smartGoal: 'GO3 — IEEE document registry with version tracking',
    mapping: { proposal: true, srs: true, sdd: true, spmp: true, std: false, code: true },
    lifecycle: {
      proposal: { ref: '§3.1 Document Management', status: 'linked' },
      srs: { ref: 'FR-DOC-02, FR-DOC-03', status: 'linked' },
      diagrams: {
        ref: 'Image 32 — Component Diagram',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 32, totalPages: 48, imageLabel: 'Image 32' },
      },
      wireframes: {
        ref: 'WF-DOC-01 Upload Cards',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 18, totalPages: 48, imageLabel: 'WF-DOC-01' },
      },
      modules: { ref: 'SDD Module 4.1 — Artifact Registry', status: 'linked' },
      testCases: { ref: 'Not found in STD', status: 'missing' },
      sourceCode: {
        ref: 'src/pages/Artifacts.jsx',
        status: 'linked',
        codeRef: { filePath: 'src/pages/Artifacts.jsx', label: 'Artifacts.jsx' },
      },
      evidence: {
        ref: 'Upload history log',
        status: 'linked',
        documentRef: { artifactId: 'proposal', page: 5, totalPages: 28, imageLabel: 'Upload History' },
      },
    },
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    smartGoal: 'GO4 — AI-powered traceability gap detection',
    mapping: { proposal: true, srs: true, sdd: false, spmp: false, std: false, code: false },
    lifecycle: {
      proposal: { ref: '§4.1 AI Audit Engine', status: 'linked' },
      srs: { ref: 'FR-AUDIT-01', status: 'linked' },
      diagrams: { ref: 'Not found in SDD', status: 'missing' },
      wireframes: { ref: 'WF-GAP-01 Issues Panel', status: 'missing' },
      modules: { ref: 'Not found in SDD', status: 'missing' },
      testCases: { ref: 'Not found in STD', status: 'missing' },
      sourceCode: { ref: 'Not implemented', status: 'missing' },
      evidence: { ref: 'N/A', status: 'missing' },
    },
  },
  {
    id: 'traceability-matrix',
    name: 'Traceability Matrix',
    smartGoal: 'GO5 — Component-level coverage visualization',
    mapping: { proposal: true, srs: true, sdd: true, spmp: false, std: false, code: true },
    lifecycle: {
      proposal: { ref: '§4.2 Traceability Dashboard', status: 'linked' },
      srs: { ref: 'FR-TRACE-02', status: 'linked' },
      diagrams: {
        ref: 'Image 24 — Matrix Wireframe',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 24, totalPages: 48, imageLabel: 'Image 24' },
      },
      wireframes: {
        ref: 'WF-MATRIX-01 Grid View',
        status: 'linked',
        documentRef: { artifactId: 'sdd', page: 26, totalPages: 48, imageLabel: 'WF-MATRIX-01' },
      },
      modules: { ref: 'SDD Module 5.1 — Matrix View', status: 'linked' },
      testCases: { ref: 'Not found in STD', status: 'missing' },
      sourceCode: {
        ref: 'src/pages/Matrix.jsx',
        status: 'linked',
        codeRef: { filePath: 'src/pages/Matrix.jsx', label: 'Matrix.jsx' },
      },
      evidence: { ref: 'Matrix export sample', status: 'missing' },
    },
  },
  {
    id: 'report-export',
    name: 'Report Export',
    smartGoal: 'GO6 — Downloadable audit and traceability reports',
    mapping: { proposal: false, srs: true, sdd: false, spmp: true, std: false, code: false },
    lifecycle: {
      proposal: { ref: 'Not referenced', status: 'missing' },
      srs: { ref: 'FR-RPT-01', status: 'linked' },
      diagrams: { ref: 'Not found in SDD', status: 'missing' },
      wireframes: { ref: 'Not found', status: 'missing' },
      modules: { ref: 'Not found in SDD', status: 'missing' },
      testCases: { ref: 'Not found in STD', status: 'missing' },
      sourceCode: { ref: 'Not implemented', status: 'missing' },
      evidence: { ref: 'N/A', status: 'missing' },
    },
  },
]

/** Weighted score for one component (0–100). */
export function computeComponentTraceabilityScore(component) {
  const weighted = artifactColumns.reduce((sum, col) => {
    return sum + (component.mapping[col.key] ? artifactWeights[col.key] : 0)
  }, 0)
  return Math.round(weighted * 1000) / 10
}

/** Project-wide score: average of all component weighted scores. */
export function computeTraceabilityScore(componentList = components) {
  if (!componentList.length) return 0
  const total = componentList.reduce(
    (sum, component) => sum + computeComponentTraceabilityScore(component),
    0,
  )
  return Math.round((total / componentList.length) * 10) / 10
}

export function computeComponentGapCount(component) {
  return artifactColumns.filter((col) => !component.mapping[col.key]).length
}

export function countMissingMappings(componentList = components) {
  return componentList.reduce((sum, component) => sum + computeComponentGapCount(component), 0)
}

export function getContinuityStatus(score) {
  if (score >= 85) return 'verified'
  if (score >= 60) return 'partial'
  return 'broken'
}

export function getAnalysisSnapshot(componentList = components) {
  const traceabilityScore = computeTraceabilityScore(componentList)
  const gapCount = countMissingMappings(componentList)
  const continuityStatus = getContinuityStatus(traceabilityScore)

  return {
    traceabilityScore,
    continuityStatus,
    gapCount,
    analyzedAt: 'May 26, 2026',
    description: traceabilityScoreDescription,
  }
}

/** Precomputed snapshot for static demo data. */
export const mappingResult = runTraceabilityMapping(components)

export const analysisSnapshot = {
  ...getAnalysisSnapshot(),
  gapCount: mappingResult.stats.gapCount,
  continuityStatus: getContinuityStatus(computeTraceabilityScore(components)),
}

function enrichLifecycle(lifecycle, artifacts) {
  return Object.fromEntries(
    Object.entries(lifecycle).map(([key, item]) => {
      const document = resolveLifecycleDocument(artifacts, item)
      const code = resolveLifecycleCode(artifacts, item)
      const viewable = document
        ? { type: 'document', ...document }
        : code ?? null

      return [
        key,
        {
          ...item,
          viewable,
          document: viewable?.type === 'document' ? viewable : null,
        },
      ]
    }),
  )
}

export function getComponent(id, artifacts = loadArtifacts()) {
  const component = components.find((c) => c.id === id)
  if (!component) return null
  const lifecycle = enrichLifecycle(component.lifecycle, artifacts)
  const enriched = {
    ...component,
    continuityScore: computeComponentTraceabilityScore(component),
    gapCount: computeComponentGapCount(component),
    lifecycle,
  }
  return {
    ...enriched,
    evaluation: buildComponentEvaluationReport(enriched),
  }
}

export function getCoverageStatus(row) {
  const traced = artifactColumns.filter((col) => row.mapping[col.key]).length
  if (traced === artifactColumns.length) return 'full'
  if (traced === 0) return 'missing'
  return 'partial'
}

export function countMappedCells(componentList = components) {
  let mapped = 0
  let total = 0
  componentList.forEach((row) => {
    artifactColumns.forEach((col) => {
      total += 1
      if (row.mapping[col.key]) mapped += 1
    })
  })
  return { mapped, total }
}

export { runTraceabilityMapping, RELATIONSHIP_TYPES, TRACE_HOPS, buildComponentEvaluationReport, formatEvaluationReportText } from './traceabilityEngine.js'
