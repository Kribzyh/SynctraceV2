import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PageBanner } from '../components/PageBanner.jsx' 
import ComponentTraceModal from '../components/ComponentTraceModal.jsx'
import { loadArtifacts } from '../utils/artifacts.js'
import {
  artifactColumns,
  components,
  getComponent,
  getCoverageStatus,
  runTraceabilityMapping,
} from '../utils/traceability.js'
import './HubPage.css'
import './TraceabilityMapping.css'

const componentMeta = {
  login: { category: 'Authentication module', description: 'Allows authorized users to securely access the system.', type: 'Functional Requirement' },
  registration: { category: 'User onboarding', description: 'Enables new users to register with role-based access.', type: 'Functional Requirement' },
  'artifact-upload': { category: 'Document management', description: 'Upload and version IEEE project artifacts.', type: 'Functional Requirement' },
  'gap-analysis': { category: 'AI audit engine', description: 'Detects traceability gaps across the lifecycle chain.', type: 'Functional Requirement' },
  'traceability-matrix': { category: 'Visualization', description: 'Displays component-level coverage across artifacts.', type: 'Functional Requirement' },
  'report-export': { category: 'Reporting', description: 'Generates downloadable audit and traceability reports.', type: 'Functional Requirement' },
}

const statusLabels = {
  full: 'Fully Traced',
  partial: 'Partially Traced',
  missing: 'Missing',
}

function getTracedCount(component) {
  return artifactColumns.filter((col) => component.mapping[col.key]).length
}

function getEvidenceLabel(item, fallback) {
  if (!item || item.status === 'missing') return fallback
  if (item.documentRef) {
    const { artifactId, page } = item.documentRef
    return `${artifactId}.pdf p.${page}`
  }
  if (item.codeRef) return item.codeRef.filePath
  return item.ref
}

function buildLifecycleSteps(component) {
  const lc = component.lifecycle
  const sddParts = [
    lc.modules?.status === 'linked' ? lc.modules.ref : null,
    lc.diagrams?.status === 'linked' ? lc.diagrams.ref : null,
    lc.wireframes?.status === 'linked' ? lc.wireframes.ref : null,
  ].filter(Boolean)

  return [
    {
      key: 'proposal',
      label: 'PROPOSAL',
      ref: lc.proposal?.ref ?? 'Not referenced',
      evidence: getEvidenceLabel(lc.proposal, 'proposal.pdf'),
      status: component.mapping.proposal && lc.proposal?.status === 'linked' ? 'linked' : 'missing',
      viewKey: 'proposal',
    },
    {
      key: 'srs',
      label: 'SRS',
      ref: lc.srs?.ref ?? 'Not found',
      evidence: getEvidenceLabel(lc.srs, 'srs.pdf'),
      status: component.mapping.srs && lc.srs?.status === 'linked' ? 'linked' : 'missing',
      viewKey: lc.srs?.documentRef ? 'srs' : null,
    },
    {
      key: 'sdd',
      label: 'SDD',
      ref: sddParts.length ? sddParts.join(' · ') : 'Not found in SDD',
      evidence: lc.modules?.documentRef
        ? `sdd.pdf p.${lc.diagrams?.documentRef?.page ?? lc.modules.documentRef?.page ?? '—'}`
        : getEvidenceLabel(lc.diagrams, 'sdd.pdf'),
      status: component.mapping.sdd && sddParts.length > 0 ? 'linked' : 'missing',
      viewKey: lc.diagrams?.viewable ? 'diagrams' : lc.modules?.viewable ? 'modules' : lc.wireframes?.viewable ? 'wireframes' : null,
    },
    {
      key: 'spmp',
      label: 'SPMP',
      ref: component.mapping.spmp ? `${component.name} delivery milestone` : 'Not scheduled',
      evidence: component.mapping.spmp ? 'spmp.pdf' : '—',
      status: component.mapping.spmp ? 'linked' : 'missing',
      viewKey: null,
    },
    {
      key: 'std',
      label: 'TEST CASES',
      ref: lc.testCases?.ref ?? 'Not found in STD',
      evidence: getEvidenceLabel(lc.testCases, 'std.pdf'),
      status: component.mapping.std && lc.testCases?.status === 'linked' ? 'linked' : 'missing',
      viewKey: lc.testCases?.viewable ? 'testCases' : null,
    },
    {
      key: 'code',
      label: 'SOURCE CODE',
      ref: lc.sourceCode?.ref ?? 'Not implemented',
      evidence: lc.sourceCode?.codeRef?.filePath ?? 'source-code/',
      status: component.mapping.code && lc.sourceCode?.status === 'linked' ? 'linked' : 'missing',
      viewKey: lc.sourceCode?.viewable ? 'sourceCode' : null,
    },
  ]
}

export default function TraceabilityMapping() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(components[0]?.id ?? null)
  const [modalComponentId, setModalComponentId] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(new Date())
  const [artifacts] = useState(loadArtifacts)

  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const status = getCoverageStatus(component)
      const matchesSearch = component.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = statusFilter === 'all' || status === statusFilter
      return matchesSearch && matchesFilter
    })
  }, [search, statusFilter])

  const selected = getComponent(selectedId, artifacts)

  useEffect(() => {
    if (!filteredComponents.some((c) => c.id === selectedId)) {
      setSelectedId(filteredComponents[0]?.id ?? components[0]?.id)
    }
  }, [filteredComponents, selectedId])

  const lifecycleSteps = selected ? buildLifecycleSteps(selected) : []
  const meta = selected ? componentMeta[selected.id] ?? { category: 'Component', description: selected.smartGoal, type: 'Functional Requirement' } : null
  const confidence = selected?.evaluation?.summary?.continuityScore ?? selected?.continuityScore ?? 0
  const coverageStatus = selected ? getCoverageStatus(selected) : 'partial'

  const continuityMessage = {
    full: 'This component is completely traced across all lifecycle artifacts.',
    partial: 'This component has partial traceability — review missing artifact links.',
    missing: 'This component has no verified traceability links.',
  }

  function handleGenerateMap() {
    if (generating) return
    setGenerating(true)
    setTimeout(() => {
      runTraceabilityMapping(components)
      setRefreshedAt(new Date())
      setGenerating(false)
    }, 1200)
  }

  return (
    <DashboardLayout>
      <div className="hub-page map-page">
    
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M8.5 8.5l7 7" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
            </svg>
          }
          title="Mapping"
          subtitle="Visualize how each component is connected across the software development lifecycle."
          rightElement={
            <button
              type="button"
              className="map-banner__btn"
              onClick={handleGenerateMap}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="map-banner__btn-spinner" aria-hidden="true" />
                  Generating…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate Traceability Map
                </>
              )}
            </button>
          }
        />

        <div className="map-layout">
          <aside className="map-panel map-panel--list">
            <input
              type="search"
              className="map-search"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="map-filters">
              {[
                { key: 'all', label: 'All Components' },
                { key: 'full', label: 'Fully Traced' },
                { key: 'partial', label: 'Partial' },
                { key: 'missing', label: 'Missing' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`map-filter${statusFilter === f.key ? ' map-filter--active' : ''}`}
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ul className="map-component-list">
              {filteredComponents.map((component) => {
                const status = getCoverageStatus(component)
                const traced = getTracedCount(component)
                return (
                  <li key={component.id}>
                    <button
                      type="button"
                      className={`map-component${selectedId === component.id ? ' map-component--selected' : ''}`}
                      onClick={() => setSelectedId(component.id)}
                    >
                      <span className={`map-component__dot map-component__dot--${status}`} />
                      <span className="map-component__info">
                        <span className="map-component__name">{component.name}</span>
                        <span className="map-component__cat">{componentMeta[component.id]?.category ?? 'Component'}</span>
                      </span>
                      <span className="map-component__frac">{traced}/{artifactColumns.length}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <button type="button" className="map-add-btn" disabled title="Coming soon">
              + Add Component
            </button>
          </aside>

          <section className="map-panel map-panel--trace">
            {selected ? (
              <>
                <div className="map-trace__head">
                  <h2>LIFECYCLE TRACE: {selected.name.toUpperCase()}</h2>
                  <span className="map-trace__confidence">Confidence: {confidence}%</span>
                </div>

                <ol className="map-trace-flow">
                  {lifecycleSteps.map((step, index) => (
                    <li key={step.key} className={`map-trace-step map-trace-step--${step.status}`}>
                      <div className="map-trace-step__rail">
                        <span className={`map-trace-step__icon map-trace-step__icon--${step.status}`}>
                          {step.status === 'linked' ? '✓' : step.status === 'missing' ? '✕' : '—'}
                        </span>
                        {index < lifecycleSteps.length - 1 ? <span className="map-trace-step__line" /> : null}
                      </div>
                      <div className="map-trace-step__body">
                        <p className="map-trace-step__label">{step.label}</p>
                        <p className="map-trace-step__ref">{step.ref}</p>
                        {step.status === 'linked' ? (
                          <button
                            type="button"
                            className="map-trace-step__evidence"
                            onClick={() => setModalComponentId(selected.id)}
                          >
                            View Evidence · {step.evidence}
                          </button>
                        ) : (
                          <span className="map-trace-step__missing">Missing link</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="map-empty">Select a component to view its lifecycle trace.</p>
            )}
          </section>

          <aside className="map-panel map-panel--detail">
            {selected && meta ? (
              <>
                <div className="map-detail__head">
                  <div>
                    <h2 className="map-detail__name">{selected.name}</h2>
                    <p className="map-detail__cat">{meta.category}</p>
                  </div>
                  <span className={`map-detail__badge map-detail__badge--${coverageStatus}`}>
                    {statusLabels[coverageStatus]}
                  </span>
                </div>

                <dl className="map-detail-list">
                  <div>
                    <dt>Description</dt>
                    <dd>{meta.description}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{meta.type}</dd>
                  </div>
                  <div>
                    <dt>SMART Goal</dt>
                    <dd>{selected.smartGoal}</dd>
                  </div>
                  <div>
                    <dt>Traceability Score</dt>
                    <dd>
                      <div className="map-progress">
                        <div className="map-progress__fill map-progress__fill--green" style={{ width: `${selected.continuityScore}%` }} />
                      </div>
                      {selected.continuityScore}%
                    </dd>
                  </div>
                  <div>
                    <dt>Confidence Score</dt>
                    <dd>
                      <div className="map-progress">
                        <div className="map-progress__fill map-progress__fill--blue" style={{ width: `${confidence}%` }} />
                      </div>
                      {confidence}%
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{statusLabels[coverageStatus]}</dd>
                  </div>
                  <div>
                    <dt>Last Updated</dt>
                    <dd>{refreshedAt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</dd>
                  </div>
                </dl>

                <div className={`map-continuity-box map-continuity-box--${coverageStatus}`}>
                  {continuityMessage[coverageStatus]}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </div>

      {modalComponentId ? (
        <ComponentTraceModal
          componentId={modalComponentId}
          onClose={() => setModalComponentId(null)}
        />
      ) : null}
    </DashboardLayout>
  )
}