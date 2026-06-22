import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PageBanner } from '../components/PageBanner.jsx' 
import ComponentTraceModal from '../components/ComponentTraceModal.jsx'
import {
  artifactColumns,
  components,
  computeComponentTraceabilityScore,
  computeTraceabilityScore,
  getCoverageStatus,
} from '../utils/traceability.js'
import './HubPage.css'
import './Matrix.css'

const matrixColumns = [
  { key: 'proposal', label: 'Proposal', abbr: 'PRP', lifecycleKey: 'proposal' },
  { key: 'srs', label: 'SRS', abbr: 'Requirements', lifecycleKey: 'srs' },
  { key: 'sdd', label: 'SDD', abbr: 'Design', lifecycleKey: 'modules' },
  { key: 'spmp', label: 'SPMP', abbr: 'Plan', lifecycleKey: null },
  { key: 'std', label: 'STD', abbr: 'Test', lifecycleKey: 'testCases' },
  { key: 'code', label: 'Source Code', abbr: 'Implementation', lifecycleKey: 'sourceCode' },
]

function getArtifactCell(component, col) {
  const mapped = component.mapping[col.key]

  if (col.key === 'spmp') {
    return mapped ? { status: 'covered' } : { status: 'missing' }
  }

  const item = col.lifecycleKey ? component.lifecycle[col.lifecycleKey] : null

  if (!mapped) {
    return { status: 'missing' }
  }

  const ref = item?.ref ?? ''
  const isBroken = item?.status === 'missing'
    || ref.toLowerCase().includes('not found')
    || ref.toLowerCase().includes('not referenced')
    || ref.toLowerCase().includes('not implemented')

  if (isBroken) {
    return { status: 'partial' }
  }

  return { status: 'covered' }
}

function getComponentCoverage(row) {
  const traced = artifactColumns.filter((col) => row.mapping[col.key]).length
  return { traced, total: artifactColumns.length }
}

function MatrixStatCard({ tone, icon, value, label, sub, featured }) {
  return (
    <div className={`matrix-stat matrix-stat--${tone}${featured ? ' matrix-stat--featured' : ''}`}>
      <div className="matrix-stat__top">
        <span className="matrix-stat__icon" aria-hidden="true">{icon}</span>
        {sub ? <span className="matrix-stat__pct">{sub}</span> : null}
      </div>
      <span className="matrix-stat__value">{value}</span>
      <span className="matrix-stat__label">{label}</span>
    </div>
  )
}

function MatrixArtifactCell({ cell }) {
  const icons = {
    covered: '✓',
    partial: '◐',
    missing: '✕',
    na: '—',
  }

  return (
    <div className={`matrix-artifact-cell matrix-artifact-cell--${cell.status}`}>
      <span className="matrix-artifact-cell__icon" aria-hidden="true">{icons[cell.status]}</span>
    </div>
  )
}

export default function Matrix() {
  const [selectedComponentId, setSelectedComponentId] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const traceabilityScore = computeTraceabilityScore(components)
  const fullItems = components.filter((row) => getCoverageStatus(row) === 'full').length
  const partialItems = components.filter((row) => getCoverageStatus(row) === 'partial').length
  const missingItems = components.filter((row) => getCoverageStatus(row) === 'missing').length
  const total = components.length

  function handleRefresh() {
    setLastUpdated(new Date())
  }

  return (
    <DashboardLayout>
      <div className="matrix-page">
        
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          }
          title="Matrix"
          subtitle="Track project requirements from objectives through to code implementation"
        />

        <div className="matrix-stat-row">
          <MatrixStatCard tone="blue" icon="◫" value={total} label="Total Components" />
          <MatrixStatCard
            tone="green"
            icon="✓"
            value={fullItems}
            label="Fully Traced"
            sub={`${total ? Math.round((fullItems / total) * 100) : 0}%`}
          />
          <MatrixStatCard
            tone="amber"
            icon="◐"
            value={partialItems}
            label="Partially Traced"
            sub={`${total ? Math.round((partialItems / total) * 100) : 0}%`}
          />
          <MatrixStatCard
            tone="red"
            icon="✕"
            value={missingItems}
            label="Missing"
            sub={`${total ? Math.round((missingItems / total) * 100) : 0}%`}
          />
          <MatrixStatCard
            tone="score"
            icon="↗"
            value={`${traceabilityScore}%`}
            label="Traceability Score"
            featured
          />
        </div>

        <div className="card matrix-table-wrap matrix-table-wrap--full">
          <div className="matrix-table__scroll">
            <table className="matrix-table matrix-table--detailed">
              <thead>
                <tr>
                  <th className="matrix-table__index">#</th>
                  <th className="matrix-table__component-col">Component</th>
                  {matrixColumns.map((col) => (
                    <th key={col.key} className="matrix-table__artifact-col">
                      <span className="matrix-table__col-label">{col.label}</span>
                      <span className="matrix-table__col-abbr">({col.abbr})</span>
                    </th>
                  ))}
                  <th className="matrix-table__coverage-col">Coverage (Score)</th>
                </tr>
              </thead>
              <tbody>
                {components.map((row, index) => {
                  const { traced, total: colTotal } = getComponentCoverage(row)
                  const status = getCoverageStatus(row)
                  const score = computeComponentTraceabilityScore(row)

                  return (
                    <tr key={row.id} className="matrix-table__row">
                      <td className="matrix-table__index">{index + 1}</td>
                      <td className="matrix-table__component">
                        <button
                          type="button"
                          className="matrix-table__component-link"
                          onClick={() => setSelectedComponentId(row.id)}
                        >
                          {row.name}
                        </button>
                      </td>
                      {matrixColumns.map((col) => {
                        const cell = getArtifactCell(row, col)
                        return (
                          <td
                            key={col.key}
                            className={`matrix-table__cell matrix-table__cell--${cell.status}`}
                          >
                            <MatrixArtifactCell cell={cell} />
                          </td>
                        )
                      })}
                      <td className="matrix-table__coverage">
                        <span className={`matrix-table__coverage-pill matrix-table__coverage-pill--${status}`}>
                          {traced}/{colTotal}
                        </span>
                        <span className="matrix-table__coverage-pct">{score}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="matrix-table__footer-block">
            <div className="matrix-footer__row">
              <div className="matrix-legend">
                <span className="matrix-legend__chip matrix-legend__chip--covered">
                  <i className="matrix-legend__icon" aria-hidden="true">✓</i>
                  Covered
                </span>
                <span className="matrix-legend__chip matrix-legend__chip--partial">
                  <i className="matrix-legend__icon" aria-hidden="true">◐</i>
                  Partial
                </span>
                <span className="matrix-legend__chip matrix-legend__chip--missing">
                  <i className="matrix-legend__icon" aria-hidden="true">✕</i>
                  Missing
                </span>
                <span className="matrix-legend__chip matrix-legend__chip--na">
                  <i className="matrix-legend__icon" aria-hidden="true">—</i>
                  N/A
                </span>
              </div>

              <div className="matrix-footer__meta">
                <span className="matrix-footer__updated">
                  Updated {lastUpdated.toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit',
                  })}
                </span>
                <button type="button" className="matrix-footer__refresh" onClick={handleRefresh}>
                  Refresh
                </button>
              </div>
            </div>

            <p className="matrix-guide">
              <span className="matrix-guide__label">Tip</span>
              Click any <strong>component name</strong> in the table to open its full traceability evaluation report.
            </p>
          </div>
        </div>
      </div>

      {selectedComponentId ? (
        <ComponentTraceModal
          componentId={selectedComponentId}
          onClose={() => setSelectedComponentId(null)}
        />
      ) : null}
    </DashboardLayout>
  )
}