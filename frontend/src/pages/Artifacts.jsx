import { useRef, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import {
  addArtifactVersion,
  artifactDefinitions,
  detectPipelineFromUpload,
  getActiveVersion,
  getArtifactDefinition,
  getPipelineSource,
  loadArtifacts,
  saveArtifacts,
  setActiveVersion,
} from '../utils/artifacts.js'
import './Artifacts.css'

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function RepoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}

function ArtifactUploadForm({ artifact, onUpload, disabled }) {
  const def = getArtifactDefinition(artifact.id)
  const [linkValue, setLinkValue] = useState('')
  const fileRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (disabled) return

    if (def.isRepo) {
      const value = linkValue.trim()
      if (!value) return
      onUpload({ pipeline: 'github', value })
      setLinkValue('')
      return
    }

    const file = fileRef.current?.files?.[0]
    if (file) {
      const pipeline = detectPipelineFromUpload({
        value: file.name,
        fileName: file.name,
        fileType: file.type,
      })
      if (!pipeline) return

      const reader = new FileReader()
      reader.onload = () => {
        onUpload({
          pipeline,
          value: file.name,
          fileName: file.name,
          fileData: typeof reader.result === 'string' ? reader.result : null,
          fileType: file.type,
        })
        if (fileRef.current) fileRef.current.value = ''
      }
      reader.readAsDataURL(file)
      return
    }

    const value = linkValue.trim()
    if (!value) return
    const pipeline = detectPipelineFromUpload({ value, isRepo: false })
    if (!pipeline) return
    onUpload({ pipeline, value })
    setLinkValue('')
  }

  return (
    <form className="artifact-upload-form" onSubmit={handleSubmit}>
      {def.isRepo ? (
        <input
          type="url"
          className="artifact-entry__input"
          value={linkValue}
          placeholder="Paste GitHub repository URL..."
          disabled={disabled}
          onChange={(e) => setLinkValue(e.target.value)}
        />
      ) : (
        <>
          <input
            type="url"
            className="artifact-entry__input"
            value={linkValue}
            placeholder="Paste Google Docs or Drive link..."
            disabled={disabled}
            onChange={(e) => setLinkValue(e.target.value)}
          />
          <div className="artifact-upload-form__divider">
            <span>or upload file</span>
          </div>
          <div className="artifact-upload-form__file">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={disabled}
              className="artifact-upload-form__file-input"
              id={`file-${artifact.id}`}
            />
            <label htmlFor={`file-${artifact.id}`} className="artifact-upload-form__file-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Choose PDF or Word file
            </label>
          </div>
        </>
      )}

      <button type="submit" className="artifact-upload-form__submit" disabled={disabled}>
        {disabled ? 'Max 3 versions reached' : `Upload ${getActiveVersion(artifact)?.label ? 'New Version' : 'Upload'}`}
      </button>
    </form>
  )
}

export default function Artifacts() {
  const [artifacts, setArtifacts] = useState(loadArtifacts)
  const [expandedHistory, setExpandedHistory] = useState(null)
  const [processingIds, setProcessingIds] = useState([])

  function persist(next) {
    setArtifacts(next)
    saveArtifacts(next)
  }

  function handleArtifactAction(artifactId, payload) {
    setProcessingIds((prev) => [...prev, artifactId])
    setTimeout(() => {
      const next = addArtifactVersion(artifacts, artifactId, payload)
      persist(next)
      setProcessingIds((prev) => prev.filter((id) => id !== artifactId))
    }, 1200)
  }

  function handleVersionSelect(artifactId, versionNumber) {
    persist(setActiveVersion(artifacts, artifactId, versionNumber))
  }

  return (
    <DashboardLayout>
      <div className="artifacts-page">
        <header className="artifacts-banner">
          <div className="artifacts-banner__left">
            <div className="artifacts-banner__icon">
              <DocIcon />
            </div>
            <div>
              <h1 className="artifacts-banner__title">Artifact Upload</h1>
              <p className="artifacts-banner__subtitle banner-accent-line--with-text">
                <span className="banner-accent-line" aria-hidden="true" />
                Upload IEEE capstone documents with version tracking.
              </p>
            </div>
          </div>
        </header>

        <div className="artifacts-list">
          {artifactDefinitions.map((def) => {
            const artifact = artifacts.find((a) => a.id === def.id)
            const active = getActiveVersion(artifact)
            const atMaxVersions = artifact.versions.length >= 3
            const isProcessing = processingIds.includes(def.id)
            const uploadStatus = isProcessing
              ? 'processing'
              : artifact.versions.length > 0
                ? 'completed'
                : 'missing'
            const versionList = [...artifact.versions].sort((a, b) => a.version - b.version)

            return (
              <article key={def.id} className="artifact-entry card">
                <div className="artifact-entry__header">
                  <div className="artifact-entry__info">
                    <div className="artifact-entry__icon">
                      {def.isRepo ? <RepoIcon /> : <DocIcon />}
                    </div>
                    <div>
                      <p className="artifact-entry__title">{def.title}</p>
                      <p className="artifact-entry__abbr">{def.abbr}</p>
                    </div>
                  </div>

                  <span className={`artifact-entry__status artifact-entry__status--${uploadStatus}`}>
                    {uploadStatus === 'processing' ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        PROCESSING
                      </>
                    ) : uploadStatus === 'completed' ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        UPLOADED
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        MISSING
                      </>
                    )}
                  </span>
                </div>

                {artifact.versions.length > 0 && (
                  <div className="artifact-versions">
                    <p className="artifact-versions__label">Versions</p>
                    <div className="artifact-versions__tabs">
                      {versionList.map((data) => (
                        <button
                          key={data.version}
                          type="button"
                          className={`artifact-versions__tab${artifact.activeVersion === data.version ? ' artifact-versions__tab--active' : ''}`}
                          onClick={() => handleVersionSelect(def.id, data.version)}
                        >
                          v{data.version}
                        </button>
                      ))}
                    </div>
                    {active && (
                      <div className="artifact-versions__active">
                        <span className="artifact-versions__source">
                          {getPipelineSource(active.pipeline)?.label}
                        </span>
                        <span className="artifact-versions__meta">
                          {active.fileName ?? active.value} · {active.uploadedAt}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <ArtifactUploadForm
                  artifact={artifact}
                  disabled={atMaxVersions || isProcessing}
                  onUpload={(payload) => handleArtifactAction(def.id, {
                    ...payload,
                    pipeline: def.isRepo ? 'github' : payload.pipeline,
                  })}
                />

                {artifact.history.length > 0 && (
                  <div className="artifact-history">
                    <button
                      type="button"
                      className="artifact-history__toggle"
                      onClick={() => setExpandedHistory(expandedHistory === def.id ? null : def.id)}
                    >
                      Upload History ({artifact.history.length})
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={expandedHistory === def.id ? 'artifact-history__chevron--open' : ''}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {expandedHistory === def.id && (
                      <ul className="artifact-history__list">
                        {artifact.history.map((entry) => (
                          <li key={entry.id} className="artifact-history__item">
                            <div className="artifact-history__top">
                              <span className="artifact-history__version">{entry.version}</span>
                              <span className="artifact-history__action">{entry.action}</span>
                              <span className="artifact-history__pipeline">
                                {getPipelineSource(entry.pipeline)?.label}
                              </span>
                            </div>
                            <p className="artifact-history__detail">
                              {entry.fileName ?? entry.value}
                            </p>
                            <p className="artifact-history__meta">
                              {entry.uploadedBy} · {entry.uploadedAt}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
