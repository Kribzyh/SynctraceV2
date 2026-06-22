import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PageBanner } from '../components/PageBanner.jsx'
import AiEngineConfigPanel from '../components/AiEngineConfigPanel.jsx'
import {
  analysisSnapshot,
  artifactColumns,
  components,
  mappingResult,
  runTraceabilityMapping,
} from '../utils/traceability.js'
import './HubPage.css'
import './Analysis.css'
import './AiConfig.css'

const ENGINE_TABS = [
  { id: 'logs', label: 'Processing Logs' },
  { id: 'config', label: 'Configuration' },
]

const defaultLogs = [
  { time: '10:42:18', level: 'info', message: '[engine] Starting AI traceability pipeline v2.1' },
  { time: '10:42:19', level: 'info', message: '[ingest] Loading Proposal, SRS, SDD, SPMP, STD artifacts' },
  { time: '10:42:22', level: 'info', message: '[ocr] Extracting text from SRS.pdf — 65 pages processed' },
  { time: '10:42:28', level: 'info', message: '[extract] Found 6 SMART goals in Proposal §2–§4' },
  { time: '10:42:31', level: 'info', message: '[extract] Parsed 42 requirement entities from SRS' },
  { time: '10:42:36', level: 'info', message: '[extract] Identified 18 SDD modules and 12 diagram references' },
  { time: '10:42:41', level: 'warn', message: '[extract] SPMP milestone dates use mixed formats — normalized' },
  { time: '10:42:45', level: 'info', message: '[map] Building component-level entity registry (6 components)' },
  { time: '10:42:52', level: 'info', message: '[link] Generated 36 cross-artifact links with confidence scores' },
  { time: '10:43:01', level: 'warn', message: '[gap] 4 extraction gaps flagged for adviser review' },
  { time: '10:43:08', level: 'ok', message: `[engine] Pipeline complete — ${mappingResult.stats.gapCount} gaps, ${mappingResult.entities.length} entities stored` },
]

function logLevelClass(level) {
  if (level === 'warn') return 'analysis-logs__msg--warn'
  if (level === 'ok') return 'analysis-logs__msg--ok'
  if (level === 'error') return 'analysis-logs__msg--error'
  return ''
}

const PAGE_SIZE = 10

export default function Analysis() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'config' ? 'config' : 'logs'

  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState(defaultLogs)
  const [lastRun, setLastRun] = useState(analysisSnapshot.analyzedAt)
  const [result, setResult] = useState(mappingResult)
  const [search, setSearch] = useState('')
  const [componentFilter, setComponentFilter] = useState('all')
  const [artifactFilter, setArtifactFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  function handleRerun() {
    setRunning(true)
    setLogs([{
      time: new Date().toLocaleTimeString(),
      level: 'info',
      message: '[engine] Re-running AI extraction pipeline...',
    }])

    const steps = [
      { level: 'info', message: '[ingest] Syncing uploaded artifact versions' },
      { level: 'info', message: '[ocr] Re-parsing document pages for text and layout' },
      { level: 'info', message: '[extract] Extracting requirements, modules, and test entities' },
      { level: 'info', message: '[normalize] Aligning entities across Proposal → Code lifecycle' },
      { level: 'info', message: '[link] Scoring traceability links with confidence model' },
      { level: 'warn', message: '[validate] Flagging incomplete extractions and missing refs' },
      { level: 'ok', message: '[engine] Extraction run finished' },
    ]

    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), ...step },
        ])
        if (i === steps.length - 1) {
          const fresh = runTraceabilityMapping(components)
          setResult(fresh)
          setRunning(false)
          setLastRun(new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          }))
          setLogs((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              level: 'ok',
              message: `[engine] Stored ${fresh.entities.length} entities, ${fresh.stats.linkCount} links, ${fresh.stats.gapCount} gaps`,
            },
          ])
        }
      }, (i + 1) * 800)
    })
  }

  const { entities, stats } = result
  const artifactCount = artifactColumns.length

  const componentOptions = useMemo(
    () => [...new Set(entities.map((entity) => entity.componentName))].sort(),
    [entities],
  )

  const artifactOptions = useMemo(
    () => [...new Set(entities.map((entity) => entity.artifactLabel))].sort(),
    [entities],
  )

  const filteredEntities = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entities.filter((entity) => {
      const matchesSearch = !query || [
        entity.componentName,
        entity.artifactLabel,
        entity.entityType,
        entity.label,
        entity.status,
      ].some((value) => value.toLowerCase().includes(query))

      const matchesComponent = componentFilter === 'all' || entity.componentName === componentFilter
      const matchesArtifact = artifactFilter === 'all' || entity.artifactLabel === artifactFilter
      const matchesStatus = statusFilter === 'all' || entity.status === statusFilter

      return matchesSearch && matchesComponent && matchesArtifact && matchesStatus
    })
  }, [entities, search, componentFilter, artifactFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEntities.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const paginatedEntities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredEntities.slice(start, start + PAGE_SIZE)
  }, [filteredEntities, safePage])

  useEffect(() => {
    setPage(1)
  }, [search, componentFilter, artifactFilter, statusFilter, entities])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const extractionSummary = [
    { artifact: 'Proposal', extracted: 6, type: 'SMART goals' },
    { artifact: 'SRS', extracted: 42, type: 'requirements' },
    { artifact: 'SDD', extracted: 30, type: 'design entities' },
    { artifact: 'SPMP', extracted: 8, type: 'milestones' },
    { artifact: 'STD', extracted: 14, type: 'test cases' },
    { artifact: 'Source Code', extracted: 6, type: 'modules' },
  ]

  function setActiveTab(tabId) {
    if (tabId === 'logs') {
      setSearchParams({})
    } else {
      setSearchParams({ tab: tabId })
    }
  }

  return (
    <DashboardLayout>
      <div className="hub-page analysis-page ai-engine-page">
        
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.4V11h4a8 8 0 1 1-8 8 8 8 0 0 1-8-8h4V9.4C6.8 8.8 6 7.5 6 6a4 4 0 0 1 4-4z" />
              <circle cx="12" cy="6" r="1" fill="currentColor" />
            </svg>
          }
          title="AI Engine"
          subtitle="Configure the AI pipeline and monitor processing logs with extraction results."
        />

        <div className="ai-engine-tabs" role="tablist" aria-label="AI Engine views">
          {ENGINE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ai-engine-tab${activeTab === tab.id ? ' ai-engine-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'config' ? (
          <AiEngineConfigPanel />
        ) : (
          <>
        <div className="analysis-status hub-card">
          <div className="analysis-status__info">
            <span className={`analysis-status__badge${running ? ' analysis-status__badge--running' : ''}`}>
              {running ? 'Processing' : 'Idle'}
            </span>
            <div>
              <p className="analysis-status__label">AI Engine Status</p>
              <p className="analysis-status__date">Last pipeline run: {lastRun}</p>
            </div>
          </div>
          <button
            type="button"
            className="hub-btn hub-btn--primary"
            disabled={running}
            onClick={handleRerun}
          >
            {running ? 'Running pipeline...' : 'Re-run Extraction'}
          </button>
        </div>

        <div className="analysis-results">
          <div className="hub-card analysis-result">
            <span className="analysis-result__value">{entities.length}</span>
            <span className="analysis-result__label">Entities Extracted</span>
          </div>
          <div className="hub-card analysis-result">
            <span className="analysis-result__value">{artifactCount}</span>
            <span className="analysis-result__label">Artifacts Processed</span>
          </div>
          <div className="hub-card analysis-result">
            <span className="analysis-result__value">{stats.avgConfidence}%</span>
            <span className="analysis-result__label">Avg Confidence</span>
          </div>
          <div className="hub-card analysis-result">
            <span className="analysis-result__value">{logs.length}</span>
            <span className="analysis-result__label">Log Entries</span>
          </div>
        </div>

        <div className="analysis-layout">
          <section className="hub-card analysis-logs">
            <h2>AI Processing Logs</h2>
            <p className="analysis-section__desc">
              Real-time output from the SyncTrace extraction and mapping engine.
            </p>
            <ul className="analysis-logs__list">
              {logs.map((log, i) => (
                <li key={`${log.time}-${i}`}>
                  <span className="analysis-logs__time">{log.time}</span>
                  <span className={`analysis-logs__msg ${logLevelClass(log.level)}`}>{log.message}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="hub-card analysis-section analysis-section--flush">
            <h2>Extraction Summary</h2>
            <p className="analysis-section__desc">
              Entity counts parsed from each IEEE artifact during the last run.
            </p>
            <ul className="analysis-extract-summary">
              {extractionSummary.map((row) => (
                <li key={row.artifact} className="analysis-extract-row">
                  <span className="analysis-extract-row__artifact">{row.artifact}</span>
                  <span className="analysis-extract-row__count">{row.extracted}</span>
                  <span className="analysis-extract-row__type">{row.type}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="hub-card analysis-section">
          <div className="analysis-extract-head">
            <div>
              <h2>Extraction Results ({filteredEntities.length} entities)</h2>
              <p className="analysis-section__desc">
                Normalized entities extracted from each artifact and linked to project components.
              </p>
            </div>
            <span className="analysis-extract-range">
              Showing {filteredEntities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredEntities.length)} of {filteredEntities.length}
            </span>
          </div>

          <div className="analysis-extract-toolbar">
            <input
              type="search"
              className="analysis-extract-search"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="analysis-extract-filter"
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
            >
              <option value="all">All Components</option>
              {componentOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <select
              className="analysis-extract-filter"
              value={artifactFilter}
              onChange={(e) => setArtifactFilter(e.target.value)}
            >
              <option value="all">All Artifacts</option>
              {artifactOptions.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <select
              className="analysis-extract-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="linked">Linked</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          <div className="analysis-table-wrap">
            <table className="analysis-table analysis-table--compact">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Artifact</th>
                  <th>Entity Type</th>
                  <th>Extracted Label</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEntities.length > 0 ? (
                  paginatedEntities.map((entity) => (
                    <tr key={entity.id}>
                      <td>{entity.componentName}</td>
                      <td>{entity.artifactLabel}</td>
                      <td><code>{entity.entityType}</code></td>
                      <td className="analysis-table__ref">{entity.label}</td>
                      <td>
                        <span className={`analysis-status-pill analysis-status-pill--${entity.status}`}>
                          {entity.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="analysis-table__empty">
                      No extraction results match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredEntities.length > PAGE_SIZE ? (
            <div className="analysis-pagination">
              <button
                type="button"
                className="analysis-pagination__btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="analysis-pagination__info">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="analysis-pagination__btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}