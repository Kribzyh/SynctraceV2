export const STORAGE_KEY = 'synctrace-artifacts'

export const pipelineSources = [
  {
    id: 'google-drive',
    label: 'Google Drive',
    short: 'Drive',
    acceptsFile: false,
    acceptsLink: true,
    placeholder: 'Paste Google Drive file or folder link...',
  },
  {
    id: 'google-docs',
    label: 'Google Docs',
    short: 'Docs',
    acceptsFile: false,
    acceptsLink: true,
    placeholder: 'Paste Google Docs link...',
  },
  {
    id: 'pdf',
    label: 'PDF File',
    short: 'PDF',
    acceptsFile: true,
    acceptsLink: false,
    accept: '.pdf',
    placeholder: 'Upload a PDF document',
  },
  {
    id: 'word',
    label: 'Microsoft Word',
    short: 'Word',
    acceptsFile: true,
    acceptsLink: false,
    accept: '.doc,.docx',
    placeholder: 'Upload a Word document (.doc, .docx)',
  },
  {
    id: 'github',
    label: 'GitHub Repo Link',
    short: 'GitHub',
    acceptsFile: false,
    acceptsLink: true,
    placeholder: 'Paste GitHub repository URL...',
  },
]

export const evaluationSystems = [
  {
    id: 'metadoc',
    label: 'MetaDoc',
    short: 'MetaDoc',
    tone: 'violet',
    description: 'Evaluates project proposals for SMART goals, scope, and proposal structure.',
  },
  {
    id: 'ieee-docs-evaluator',
    label: 'IEEE Docs Evaluator',
    short: 'IEEE Evaluator',
    tone: 'blue',
    description: 'Evaluates SRS through STD for IEEE documentation compliance and lifecycle traceability.',
  },
  {
    id: 'synctrace',
    label: 'SyncTrace',
    short: 'SyncTrace',
    tone: 'gold',
    description: 'Evaluates source code traceability against SDD components and implementation links.',
  },
]

const artifactEvaluatorMap = {
  proposal: 'metadoc',
  srs: 'ieee-docs-evaluator',
  sdd: 'ieee-docs-evaluator',
  spmp: 'ieee-docs-evaluator',
  std: 'ieee-docs-evaluator',
  repo: 'synctrace',
}

export function getEvaluationSystem(id) {
  return evaluationSystems.find((system) => system.id === id) ?? null
}

export function getArtifactEvaluator(artifactId) {
  const systemId = artifactEvaluatorMap[artifactId]
  return systemId ? getEvaluationSystem(systemId) : null
}

export function isSyncTraceEvaluated(artifactId) {
  return artifactEvaluatorMap[artifactId] === 'synctrace'
}

export const artifactDefinitions = [
  {
    id: 'proposal',
    title: 'Project Proposal',
    abbr: 'PROPOSAL',
    isRepo: false,
    defaultPipeline: 'google-docs',
  },
  {
    id: 'srs',
    title: 'Software Requirements Specification',
    abbr: 'SRS',
    isRepo: false,
    defaultPipeline: 'google-docs',
  },
  {
    id: 'sdd',
    title: 'Software Design Description',
    abbr: 'SDD',
    isRepo: false,
    defaultPipeline: 'pdf',
  },
  {
    id: 'spmp',
    title: 'Software Project Management Plan',
    abbr: 'SPMP',
    isRepo: false,
    defaultPipeline: 'word',
  },
  {
    id: 'std',
    title: 'Software Test Documentation',
    abbr: 'STD',
    isRepo: false,
    defaultPipeline: 'pdf',
  },
  {
    id: 'repo',
    title: 'Source Code',
    abbr: 'SOURCE CODE',
    isRepo: true,
    defaultPipeline: 'github',
  },
]

function formatTimestamp(date = new Date()) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function createVersion(versionNumber, { pipeline, value, fileName, uploadedBy = 'Project Leader', fileData = null, fileType = null }) {
  return {
    version: versionNumber,
    label: `v${versionNumber}`,
    pipeline,
    value,
    fileName: fileName ?? null,
    fileData,
    fileType,
    uploadedAt: formatTimestamp(),
    uploadedBy,
  }
}

function createHistoryEntry(action, versionEntry) {
  return {
    id: `${Date.now()}-${versionEntry.version}`,
    action,
    version: versionEntry.label,
    pipeline: versionEntry.pipeline,
    value: versionEntry.value,
    fileName: versionEntry.fileName,
    uploadedAt: versionEntry.uploadedAt,
    uploadedBy: versionEntry.uploadedBy,
  }
}

const seedArtifacts = [
  {
    id: 'proposal',
    pipeline: 'google-docs',
    activeVersion: 2,
    versions: [
      createVersion(1, {
        pipeline: 'google-docs',
        value: 'https://docs.google.com/document/d/1kXyZ9AbCdEfGhIjKlMnOpQrStUvWxYz/edit',
        uploadedBy: 'Niña Villadarez',
      }),
      createVersion(2, {
        pipeline: 'google-docs',
        value: 'https://docs.google.com/document/d/1kXyZ9AbCdEfGhIjKlMnOpQrStUvWxYz/edit?revision=2',
        uploadedBy: 'Niña Villadarez',
      }),
    ],
    history: [],
  },
  {
    id: 'srs',
    pipeline: 'google-drive',
    activeVersion: 1,
    versions: [
      createVersion(1, {
        pipeline: 'google-drive',
        value: '[SRS] GO1 - 2526-sem2-it411-06 | PERALES, CLINT R.pdf',
        fileName: '[SRS] GO1 - 2526-sem2-it411-06 | PERALES, CLINT R.pdf',
        uploadedBy: 'Niña Villadarez',
      }),
    ],
    history: [],
  },
  {
    id: 'sdd',
    pipeline: 'pdf',
    activeVersion: 1,
    versions: [
      createVersion(1, {
        pipeline: 'pdf',
        value: '[SDD] SyncTrace Design v1.0.pdf',
        fileName: '[SDD] SyncTrace Design v1.0.pdf',
        uploadedBy: 'Niña Villadarez',
      }),
    ],
    history: [],
  },
  {
    id: 'repo',
    pipeline: 'github',
    activeVersion: 1,
    versions: [
      createVersion(1, {
        pipeline: 'github',
        value: 'https://github.com/synctrace/capstone',
        fileName: 'github.com/synctrace/capstone',
        uploadedBy: 'Niña Villadarez',
      }),
    ],
    history: [],
  },
]

seedArtifacts.forEach((artifact) => {
  artifact.history = artifact.versions.flatMap((v) => [
    createHistoryEntry('upload', v),
  ])
})

function buildDefaultArtifact(def) {
  return {
    id: def.id,
    pipeline: def.defaultPipeline,
    activeVersion: 0,
    versions: [],
    history: [],
  }
}

export function getPipelineSource(id) {
  return pipelineSources.find((source) => source.id === id)
}

/** Infer intake source from an upload payload (link URL or file metadata). */
export function detectPipelineFromUpload({ value, fileName, fileType, isRepo = false }) {
  if (isRepo) return 'github'

  const url = (value ?? '').trim().toLowerCase()
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('docs.google.com')) return 'google-docs'
    if (url.includes('drive.google.com')) return 'google-drive'
    if (url.includes('github.com') || url.includes('gitlab.com')) return 'github'
    return 'google-drive'
  }

  const name = (fileName ?? value ?? '').toLowerCase()
  if (name.endsWith('.pdf') || fileType === 'application/pdf') return 'pdf'
  if (
    name.endsWith('.doc')
    || name.endsWith('.docx')
    || fileType?.includes('word')
    || fileType?.includes('document')
  ) {
    return 'word'
  }

  return null
}

export function getArtifactIntakeSource(artifact) {
  const active = getActiveVersion(artifact)
  if (!active?.pipeline) return null
  return getPipelineSource(active.pipeline)
}

export function getArtifactDefinition(id) {
  return artifactDefinitions.find((def) => def.id === id)
}

export function getArtifactStatus(artifact) {
  return artifact.versions.length > 0 ? 'uploaded' : 'missing'
}

export function getActiveVersion(artifact) {
  return artifact.versions.find((v) => v.version === artifact.activeVersion) ?? null
}

export function loadArtifacts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return artifactDefinitions.map((def) => {
        const seeded = seedArtifacts.find((a) => a.id === def.id)
        return seeded ? { ...seeded } : buildDefaultArtifact(def)
      })
    }

    const parsed = JSON.parse(saved)
    return artifactDefinitions.map((def) => {
      const savedArtifact = parsed.find((a) => a.id === def.id)
      if (!savedArtifact) return buildDefaultArtifact(def)
      return {
        ...buildDefaultArtifact(def),
        ...savedArtifact,
        pipeline: def.isRepo ? 'github' : savedArtifact.pipeline,
      }
    })
  } catch {
    return artifactDefinitions.map((def) => buildDefaultArtifact(def))
  }
}

export function saveArtifacts(artifacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artifacts))
}

export function addArtifactVersion(artifacts, artifactId, payload) {
  const uploadedBy = payload.uploadedBy ?? 'Project Leader'

  return artifacts.map((artifact) => {
    if (artifact.id !== artifactId) return artifact

    const nextVersionNumber = artifact.versions.length + 1
    if (nextVersionNumber > 3) return artifact

    const versionEntry = createVersion(nextVersionNumber, {
      pipeline: payload.pipeline,
      value: payload.value,
      fileName: payload.fileName,
      fileData: payload.fileData ?? null,
      fileType: payload.fileType ?? null,
      uploadedBy,
    })

    return {
      ...artifact,
      pipeline: payload.pipeline,
      activeVersion: nextVersionNumber,
      versions: [...artifact.versions, versionEntry],
      history: [createHistoryEntry('upload', versionEntry), ...artifact.history],
    }
  })
}

export function setActiveVersion(artifacts, artifactId, versionNumber) {
  return artifacts.map((artifact) =>
    artifact.id === artifactId ? { ...artifact, activeVersion: versionNumber } : artifact,
  )
}

export function updateArtifactPipeline(artifacts, artifactId, pipeline) {
  return artifacts.map((artifact) => {
    if (artifact.id !== artifactId) return artifact
    const def = getArtifactDefinition(artifactId)
    if (def?.isRepo) return artifact
    return { ...artifact, pipeline }
  })
}
