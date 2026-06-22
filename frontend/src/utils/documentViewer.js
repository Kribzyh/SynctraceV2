import { getActiveVersion, getArtifactDefinition } from './artifacts.js'

const sourceFiles = import.meta.glob('../pages/*.{jsx,js}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export function getBundledPagePath(artifactId, page) {
  return `/documents/${artifactId}/page-${page}.svg`
}

export function formatDocumentFileLabel(artifactId, activeVersion) {
  const def = getArtifactDefinition(artifactId)
  const abbr = def?.abbr ?? artifactId.toUpperCase()
  const name = activeVersion?.fileName ?? activeVersion?.value ?? 'Document'
  return `File: [${abbr}] ${name}`
}

function getSourceFileContent(filePath) {
  const relative = filePath.replace(/^src\//, '../')
  return sourceFiles[relative] ?? null
}

/**
 * Resolve a lifecycle document reference to a viewable page from uploaded artifacts.
 * Uploaded image files are shown directly; PDF/link uploads use extracted page images
 * bundled with the demo or stored on the artifact version after upload.
 */
export function resolveDocumentPage(artifacts, documentRef) {
  if (!documentRef) return null

  const artifact = artifacts.find((item) => item.id === documentRef.artifactId)
  const active = artifact ? getActiveVersion(artifact) : null
  if (!active) return null

  const fileLabel = formatDocumentFileLabel(documentRef.artifactId, active)
  const page = documentRef.page
  const totalPages = documentRef.totalPages

  if (active.pageImages?.[page]) {
    return {
      src: active.pageImages[page],
      page,
      totalPages,
      fileLabel,
      imageLabel: documentRef.imageLabel,
      artifactId: documentRef.artifactId,
    }
  }

  if (active.fileData?.startsWith('data:image/')) {
    return {
      src: active.fileData,
      page: 1,
      totalPages: 1,
      fileLabel,
      imageLabel: documentRef.imageLabel,
      artifactId: documentRef.artifactId,
    }
  }

  return {
    src: getBundledPagePath(documentRef.artifactId, page),
    page,
    totalPages,
    fileLabel,
    imageLabel: documentRef.imageLabel,
    artifactId: documentRef.artifactId,
  }
}

export function resolveLifecycleDocument(artifacts, lifecycleItem) {
  if (lifecycleItem.status !== 'linked' || !lifecycleItem.documentRef) return null
  return resolveDocumentPage(artifacts, lifecycleItem.documentRef)
}

export function resolveLifecycleCode(artifacts, lifecycleItem) {
  if (lifecycleItem.status !== 'linked' || !lifecycleItem.codeRef) return null

  const content = getSourceFileContent(lifecycleItem.codeRef.filePath)
  if (!content) return null

  const repoArtifact = artifacts.find((item) => item.id === 'repo')
  const active = repoArtifact ? getActiveVersion(repoArtifact) : null
  const fileLabel = active
    ? formatDocumentFileLabel('repo', active)
    : 'File: [SOURCE CODE] github.com/synctrace/capstone'

  return {
    type: 'code',
    content,
    filePath: lifecycleItem.codeRef.filePath,
    fileLabel,
    imageLabel: lifecycleItem.codeRef.label,
    page: 1,
    totalPages: 1,
  }
}
