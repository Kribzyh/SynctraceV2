import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DocumentPageViewer from './DocumentPageViewer.jsx'
import { loadArtifacts } from '../utils/artifacts.js'
import { getUserRole } from '../utils/session.js'
import { getSelectedProjectId, getProjectTraceData } from '../utils/adviserProjects.js'
import { getAdviserProject } from '../utils/adviserTeams.js'
import { artifactColumns, formatEvaluationReportText, getComponent, mappingResult } from '../utils/traceability.js'
import { collectViewablePages, lifecyclePageLabels } from '../utils/viewablePages.js'
import './ComponentTraceModal.css'

const lifecycleLabels = lifecyclePageLabels

const artifactTraceKeys = {
  proposal: 'proposal',
  srs: 'srs',
  sdd: 'modules',
  spmp: null,
  std: 'testCases',
  code: 'sourceCode',
}

const evidenceKeys = ['testCases', 'evidence']

const tabs = [
  { id: 'view', label: 'View' },
  { id: 'pages', label: 'Pages' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'gaps', label: 'Gap Analysis' },
]

function ComponentGapAnalysis({ gaps, componentName }) {
  const severityCounts = useMemo(() => ({
    high: gaps.filter((gap) => gap.severity === 'high').length,
    medium: gaps.filter((gap) => gap.severity === 'medium').length,
    low: gaps.filter((gap) => gap.severity === 'low').length,
  }), [gaps])

  if (gaps.length === 0) {
    return (
      <section className="trace-section">
        <div className="trace-section__head">Gap Analysis</div>
        <div className="trace-section__body">
          <div className="trace-gaps-empty">
            <p>No gaps detected for <strong>{componentName}</strong>.</p>
            <p className="trace-gaps-empty__hint">All lifecycle links are traced for this component.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="trace-section">
      <div className="trace-section__head">Gap Analysis</div>
      <div className="trace-section__body">
        <p className="trace-gaps__intro">
          Lifecycle gaps affecting <strong>{componentName}</strong>. Review missing artifact links and recommended fixes below.
        </p>

        <div className="trace-gaps__summary">
          <span className="trace-gaps__count">
            <strong>{gaps.length}</strong> gap{gaps.length !== 1 ? 's' : ''} for this component
          </span>
          <div className="trace-gaps__severity">
            {severityCounts.high > 0 ? (
              <span className="trace-gaps__severity-pill trace-gaps__severity-pill--high">
                {severityCounts.high} High
              </span>
            ) : null}
            {severityCounts.medium > 0 ? (
              <span className="trace-gaps__severity-pill trace-gaps__severity-pill--medium">
                {severityCounts.medium} Medium
              </span>
            ) : null}
            {severityCounts.low > 0 ? (
              <span className="trace-gaps__severity-pill trace-gaps__severity-pill--low">
                {severityCounts.low} Low
              </span>
            ) : null}
          </div>
        </div>

        <ul className="trace-gaps-list">
          {gaps.map((gap) => (
            <li key={gap.id} className={`trace-gap-card trace-gap-card--${gap.severity}`}>
              <div className="trace-gap-card__head">
                <h3 className="trace-gap-card__title">{gap.title}</h3>
                <span className={`trace-gap-card__severity trace-gap-card__severity--${gap.severity}`}>
                  {gap.severity}
                </span>
              </div>
              <p className="trace-gap-card__link">{gap.from} → {gap.to}</p>
              {gap.description ? (
                <p className="trace-gap-card__desc">{gap.description}</p>
              ) : null}
              {gap.fix ? (
                <p className="trace-gap-card__fix">
                  <strong>Suggested fix:</strong> {gap.fix}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FormattedText({ text }) {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index} className="eval-card__code">{part.slice(1, -1)}</code>
        }
        return part
      })}
    </>
  )
}

function ExtractedPageCard({ page, onOpen }) {
  const pageLabel = page.type === 'code'
    ? page.filePath
    : `Page ${page.page} of ${page.totalPages}`

  return (
    <button type="button" className="trace-page-card" onClick={() => onOpen(page.id)}>
      <div className={`trace-page-card__thumb${page.type === 'code' ? ' trace-page-card__thumb--code' : ''}`}>
        {page.type === 'code' ? (
          <pre className="trace-page-card__code-preview"><code>{page.content?.slice(0, 320)}</code></pre>
        ) : (
          <img src={page.src} alt={`${page.label} — ${page.ref}`} loading="lazy" />
        )}
      </div>
      <div className="trace-page-card__meta">
        <span className="trace-page-card__badge">{page.label}</span>
        <span className="trace-page-card__title">{page.imageLabel || page.label}</span>
        <span className="trace-page-card__ref">{page.ref}</span>
        <span className="trace-page-card__page">{pageLabel}</span>
      </div>
    </button>
  )
}

function EvaluationCard({ card, pageMeta, onOpen }) {
  return (
    <article className={`eval-card eval-card--${card.status}`}>
      <div className="eval-card__head">
        {pageMeta ? (
          <button
            type="button"
            className="eval-card__badge eval-card__badge--btn"
            onClick={() => onOpen(pageMeta.id)}
          >
            {card.badge}
          </button>
        ) : (
          <span className="eval-card__badge">{card.badge}</span>
        )}
        <h3 className="eval-card__title">{card.title}</h3>
        {card.confidence > 0 ? (
          <span className={`eval-card__score eval-card__score--${card.status}`}>
            {card.confidence}%
          </span>
        ) : null}
      </div>

      <ul className="eval-card__points">
        <li>
          <strong>Notation observed:</strong>{' '}
          <FormattedText text={card.notationObserved} />
        </li>
        <li>
          <strong>Correctness:</strong>{' '}
          <FormattedText text={card.correctness} />
        </li>
        <li>
          <strong>Issues:</strong>
          <ul className="eval-card__issues">
            {card.issues.map((issue, index) => (
              <li key={index}><FormattedText text={issue} /></li>
            ))}
          </ul>
        </li>
        <li>
          <strong>Alignment:</strong>{' '}
          <FormattedText text={card.alignment} />
        </li>
      </ul>
    </article>
  )
}

export default function ComponentTraceModal({ componentId, onClose, projectId: projectIdProp }) {
  const [artifacts, setArtifacts] = useState(loadArtifacts)
  const [activeTab, setActiveTab] = useState('view')
  const [viewerPages, setViewerPages] = useState([])
  const [pageIndex, setPageIndex] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    setArtifacts(loadArtifacts())
    setActiveTab('view')
    setPageIndex(null)
    setCopyStatus('')
  }, [componentId])

  const component = getComponent(componentId, artifacts)
  const isAdviser = getUserRole() === 'adviser'
  const adviserProjectId = projectIdProp ?? (isAdviser ? getSelectedProjectId() : null)

  const componentGaps = useMemo(() => {
    if (!component) return []

    let allGaps = mappingResult.gaps
    if (isAdviser && adviserProjectId) {
      const project = getAdviserProject(adviserProjectId)
      if (project) {
        allGaps = getProjectTraceData(project).mappingResult.gaps ?? []
      }
    }

    return allGaps.filter(
      (gap) => gap.componentId === componentId || gap.component === component.name,
    )
  }, [component, componentId, isAdviser, adviserProjectId])

  const viewablePages = useMemo(
    () => (component ? collectViewablePages(component) : []),
    [component],
  )

  const evidencePages = useMemo(
    () => viewablePages.filter((page) => evidenceKeys.includes(page.id)),
    [viewablePages],
  )

  const mappedCount = useMemo(
    () => (component ? artifactColumns.filter((col) => component.mapping[col.key]).length : 0),
    [component],
  )

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && pageIndex === null) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [pageIndex, onClose])

  if (!component) return null

  const gapAnalysisLink = isAdviser
    ? `/adviser/continuity/${adviserProjectId}`
    : '/continuity'
  const { evaluation } = component

  function openViewablePage(key, pages = viewablePages) {
    const idx = pages.findIndex((page) => page.id === key)
    if (idx >= 0) {
      setViewerPages(pages)
      setPageIndex(idx)
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setPageIndex(null)
  }

  async function handleCopyReport() {
    try {
      await navigator.clipboard.writeText(formatEvaluationReportText(evaluation))
      setCopyStatus('Copied')
      setTimeout(() => setCopyStatus(''), 2000)
    } catch {
      setCopyStatus('Failed')
      setTimeout(() => setCopyStatus(''), 2000)
    }
  }

  return (
    <>
      <div className="trace-modal-overlay" onClick={onClose} role="presentation">
        <div
          className="trace-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="trace-modal-title"
        >
          <header className="trace-modal__header">
            <div>
              <h2 id="trace-modal-title" className="trace-modal__title">Traceability Evaluation Report</h2>
              <p className="trace-modal__file">
                Component: {component.name} | {component.smartGoal}
              </p>
            </div>
            <button type="button" className="trace-modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>

          <div className="trace-modal__tabs" role="tablist" aria-label="Evaluation report views">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`trace-modal__tab${activeTab === tab.id ? ' trace-modal__tab--active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="trace-modal__body">
            {activeTab === 'view' ? (
              <div className="eval-report">
                <div className="eval-report__summary">
                  <span><strong>{evaluation.summary.continuityScore}%</strong> continuity</span>
                  <span><strong>{evaluation.summary.gapCount}</strong> gap{evaluation.summary.gapCount !== 1 ? 's' : ''}</span>
                  <span><strong>{mappedCount}/{artifactColumns.length}</strong> artifacts mapped</span>
                </div>

                {evaluation.cards.map((card) => {
                  const pageMeta = card.lifecycleKey
                    ? viewablePages.find((page) => page.id === card.lifecycleKey)
                    : null

                  return (
                    <EvaluationCard
                      key={card.id}
                      card={card}
                      pageMeta={pageMeta}
                      onOpen={(id) => openViewablePage(id)}
                    />
                  )
                })}
              </div>
            ) : null}

            {activeTab === 'pages' ? (
              <section className="trace-section trace-section--pages">
                <div className="trace-section__head">Extracted Pages</div>
                <div className="trace-section__body">
                  <p className="trace-pages__intro">
                    Document pages and source files extracted from IEEE artifacts for{' '}
                    <strong>{component.name}</strong>.
                  </p>
                  {viewablePages.length > 0 ? (
                    <>
                      <p className="trace-pages__count">
                        <strong>{viewablePages.length}</strong>{' '}
                        extracted page{viewablePages.length !== 1 ? 's' : ''} linked to this component
                      </p>
                      <div className="trace-pages-grid">
                        {viewablePages.map((page) => (
                          <ExtractedPageCard
                            key={page.id}
                            page={page}
                            onOpen={(id) => openViewablePage(id)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="trace-pages-empty">
                      <p>No extracted pages found for this component.</p>
                      <p className="trace-pages-empty__hint">
                        Upload artifacts and link document references to view extracted pages here.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {activeTab === 'coverage' ? (
              <section className="trace-section">
                <div className="trace-section__head">IEEE Artifact Mapping</div>
                <div className="trace-section__body">
                  <div className="trace-coverage-summary">
                    <span><strong>{mappedCount}</strong> of {artifactColumns.length} artifacts mapped</span>
                    <span><strong>{component.continuityScore}%</strong> continuity score</span>
                    <span><strong>{component.gapCount}</strong> open gap{component.gapCount !== 1 ? 's' : ''}</span>
                  </div>
                  <ul className="trace-coverage-grid">
                    {artifactColumns.map((col) => {
                      const mapped = component.mapping[col.key]
                      const traceKey = artifactTraceKeys[col.key]
                      const traceItem = traceKey ? component.lifecycle[traceKey] : null
                      const evalCard = evaluation.cards.find((card) => card.artifactKey === col.key)

                      return (
                        <li
                          key={col.key}
                          className={`trace-coverage-card trace-coverage-card--${mapped ? 'yes' : 'no'}`}
                        >
                          <div className="trace-coverage-card__head">
                            <span className="trace-coverage-card__label">{col.label}</span>
                            <span className={`trace-coverage-card__status trace-coverage-card__status--${mapped ? 'yes' : 'no'}`}>
                              {mapped ? 'Mapped' : 'Missing'}
                            </span>
                          </div>
                          {traceItem ? (
                            <p className="trace-coverage-card__ref">{traceItem.ref}</p>
                          ) : (
                            <p className="trace-coverage-card__ref trace-coverage-card__ref--muted">
                              {mapped ? 'Trace link verified in matrix' : 'No mapping found for this artifact'}
                            </p>
                          )}
                          {evalCard && evalCard.issues[0] && !evalCard.issues[0].includes('No continuity') ? (
                            <p className="trace-coverage-card__issue">{evalCard.issues[0]}</p>
                          ) : null}
                          {traceItem && viewablePages.find((page) => page.id === traceKey) ? (
                            <button
                              type="button"
                              className="trace-coverage-card__view"
                              onClick={() => openViewablePage(traceKey)}
                            >
                              View linked artifact
                            </button>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            ) : null}

            {activeTab === 'evidence' ? (
              <>
                <section className="trace-section">
                  <div className="trace-section__head">Verification Evidence</div>
                  <div className="trace-section__body">
                    <p className="trace-evidence__intro">
                      Test cases and proof files that demonstrate this component was verified
                      and implemented correctly.
                    </p>
                    {evidenceKeys.map((key) => {
                      const item = component.lifecycle[key]
                      const evalCard = evaluation.cards.find((card) => card.lifecycleKey === key)

                      return (
                        <article key={key} className={`eval-card eval-card--${item.status}`}>
                          <div className="eval-card__head">
                            <span className="eval-card__badge">{lifecycleLabels[key]}</span>
                            <h3 className="eval-card__title">{lifecycleLabels[key]}</h3>
                          </div>
                          <ul className="eval-card__points">
                            <li><strong>Reference:</strong> {item.ref}</li>
                            {evalCard ? (
                              <>
                                <li><strong>Correctness:</strong> {evalCard.correctness}</li>
                                <li>
                                  <strong>Issues:</strong>
                                  <ul className="eval-card__issues">
                                    {evalCard.issues.map((issue, index) => (
                                      <li key={index}>{issue}</li>
                                    ))}
                                  </ul>
                                </li>
                              </>
                            ) : null}
                          </ul>
                          {viewablePages.find((page) => page.id === key) ? (
                            <button
                              type="button"
                              className="trace-coverage-card__view"
                              onClick={() => openViewablePage(key, evidencePages.length ? evidencePages : viewablePages)}
                            >
                              View proof file
                            </button>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                </section>

                {evidencePages.length > 0 ? (
                  <section className="trace-section">
                    <div className="trace-section__head">Viewable Proof Files</div>
                    <div className="trace-section__body">
                      <ul className="trace-evidence-list">
                        {evidencePages.map((page) => (
                          <li key={page.id}>
                            <button
                              type="button"
                              className="trace-evidence-list__btn"
                              onClick={() => openViewablePage(page.id, evidencePages)}
                            >
                              <span className="trace-evidence-list__badge">{page.imageLabel}</span>
                              <span className="trace-evidence-list__label">{page.label}</span>
                              <span className="trace-evidence-list__ref">{page.ref}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                ) : null}
              </>
            ) : null}

            {activeTab === 'gaps' ? (
              <ComponentGapAnalysis gaps={componentGaps} componentName={component.name} />
            ) : null}
          </div>

          <footer className="trace-modal__footer">
            <button type="button" className="trace-btn trace-btn--ghost" onClick={handleCopyReport}>
              {copyStatus || 'Copy Text'}
            </button>
            {!isAdviser ? (
              <Link to="/artifacts" className="trace-btn trace-btn--ghost" onClick={onClose}>
                Edit Artifacts
              </Link>
            ) : null}
            <button type="button" className="trace-btn trace-btn--ghost" onClick={onClose}>
              Return
            </button>
            {!isAdviser ? (
              <Link to={gapAnalysisLink} className="trace-btn trace-btn--primary" onClick={onClose}>
                View Gap Analysis
              </Link>
            ) : null}
          </footer>
        </div>
      </div>

      {pageIndex !== null && viewerPages.length > 0 ? (
        <DocumentPageViewer
          pages={viewerPages}
          index={pageIndex}
          onClose={() => {
            setPageIndex(null)
            setViewerPages([])
          }}
          onChange={setPageIndex}
        />
      ) : null}
    </>
  )
}
