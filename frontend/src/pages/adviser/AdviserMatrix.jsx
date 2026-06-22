import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import ComponentTraceModal from '../../components/ComponentTraceModal.jsx'
import GapOverviewPanel from '../../components/GapOverviewPanel.jsx'
import {
  artifactColumns,
  getCoverageStatus,
} from '../../utils/traceability.js'
import {
  getAssignedProject,
  getProjectTraceData,
  setSelectedProjectId,
} from '../../utils/adviserProjects.js'
import '../HubPage.css'
import './AdviserPages.css'
import '../Matrix.css'

function MatrixCell({ traced, heatmap }) {
  if (traced) {
    return <span className="matrix-table__check" aria-label="Traced">✓</span>
  }
  return (
    <span
      className={`matrix-table__empty${heatmap ? ' matrix-table__empty--heatmap' : ''}`}
      aria-label="Not traced"
    >
      —
    </span>
  )
}

export default function AdviserMatrix() {
  const { projectId } = useParams()
  const project = getAssignedProject(projectId)
  const [filter, setFilter] = useState('all')
  const [artifactFilter, setArtifactFilter] = useState('all')
  const [heatmap, setHeatmap] = useState(true)
  const [selectedComponentId, setSelectedComponentId] = useState(null)

  useEffect(() => {
    if (project) setSelectedProjectId(project.id)
  }, [project])

  if (!project) {
    return <Navigate to="/adviser/dashboard" replace />
  }

  const trace = getProjectTraceData(project)
  const components = trace.components ?? []

  if (!components.length) {
    return (
      <AdviserLayout>
        <div className="hub-page adviser-page">
          <header className="hub-banner">
            <div className="hub-banner__left">
              <div className="hub-banner__icon hub-banner__icon--layers">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
              </div>
              <div>
                <h1 className="hub-banner__title">Matrix Viewer</h1>
                <p className="hub-banner__subtitle">Team {project.teamCode} — detailed matrix not available for demo project.</p>
              </div>
            </div>
          </header>
          <section className="card" style={{ padding: '24px' }}>
            <p style={{ margin: 0, color: '#6b7280' }}>View the project review page for summary data, or select Team 16 for full matrix data.</p>
            <Link to={`/adviser/review/${project.id}`} className="adviser-btn adviser-btn--primary" style={{ marginTop: 16 }}>
              Back to Project Review
            </Link>
          </section>
        </div>
      </AdviserLayout>
    )
  }

  const filteredRows = components.filter((row) => {
    const statusMatch = filter === 'all' || getCoverageStatus(row) === filter
    if (artifactFilter === 'all') return statusMatch
    return statusMatch && !row.mapping[artifactFilter]
  })

  const filters = [
    { key: 'all', label: 'All', count: components.length },
    { key: 'full', label: 'Full', count: components.filter((r) => getCoverageStatus(r) === 'full').length },
    { key: 'partial', label: 'Partial', count: components.filter((r) => getCoverageStatus(r) === 'partial').length },
    { key: 'missing', label: 'Missing', count: components.filter((r) => getCoverageStatus(r) === 'missing').length },
  ]

  return (
    <AdviserLayout>
      <div className="matrix-page adviser-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon hub-banner__icon--layers">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <h1 className="hub-banner__title">Traceability Matrix Viewer</h1>
              <p className="hub-banner__subtitle banner-accent-line--with-text">
                <span className="banner-accent-line" aria-hidden="true" />
                View-only matrix · Team {project.teamCode} · missing links highlighted
              </p>
            </div>
          </div>
        </header>

        <GapOverviewPanel gaps={trace.mappingResult.gaps} />

        <div className="card matrix-table-wrap matrix-table-wrap--full">
          <div className="matrix-table__toolbar">
            <div className="adviser-heatmap-legend">
              <span><i className="adviser-heatmap-dot" style={{ background: '#dcfce7' }} /> Mapped</span>
              <span><i className="adviser-heatmap-dot" style={{ background: '#fee2e2' }} /> Missing link</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={heatmap} onChange={(e) => setHeatmap(e.target.checked)} />
                Heatmap
              </label>
            </div>
            <div className="matrix-table__filters-row">
              <div className="matrix-filters">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className={`matrix-filter${filter === f.key ? ' matrix-filter--active' : ''}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                    <span className="matrix-filter__count">{f.count}</span>
                  </button>
                ))}
              </div>
              <select
                className="matrix-artifact-filter"
                value={artifactFilter}
                onChange={(e) => setArtifactFilter(e.target.value)}
              >
                <option value="all">All artifacts</option>
                {artifactColumns.map((col) => (
                  <option key={col.key} value={col.key}>Filter: {col.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="matrix-table__scroll">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Component</th>
                  {artifactColumns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Coverage</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const traced = artifactColumns.filter((col) => row.mapping[col.key]).length
                  const status = getCoverageStatus(row)

                  return (
                    <tr
                      key={row.id}
                      className="matrix-table__row"
                      onClick={() => setSelectedComponentId(row.id)}
                    >
                      <td className="matrix-table__component">
                        <span className="matrix-table__component-name">{row.name}</span>
                        <span className={`matrix-table__status-dot matrix-table__status-dot--${status}`} />
                      </td>
                      {artifactColumns.map((col) => (
                        <td
                          key={col.key}
                          className={`matrix-table__cell${!row.mapping[col.key] ? ' matrix-table__cell--missing' : ''}${heatmap && !row.mapping[col.key] ? ' matrix-table__cell--heatmap' : ''}`}
                        >
                          <MatrixCell traced={row.mapping[col.key]} heatmap={heatmap} />
                        </td>
                      ))}
                      <td className="matrix-table__coverage">
                        <span className={`matrix-table__coverage-pill matrix-table__coverage-pill--${status}`}>
                          {traced}/{artifactColumns.length}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="matrix-table__footer">
            Click a component row to inspect lifecycle trace. Adviser view is read-only.
          </p>
        </div>

        <div className="adviser-actions">
          <Link to={`/adviser/inspection/${project.id}`} className="adviser-btn adviser-btn--outline">
            Component Inspection
          </Link>
          <Link to={`/adviser/review/${project.id}`} className="adviser-btn adviser-btn--primary">
            Back to Project Review
          </Link>
        </div>
      </div>

      {selectedComponentId ? (
        <ComponentTraceModal
          componentId={selectedComponentId}
          projectId={project.id}
          onClose={() => setSelectedComponentId(null)}
        />
      ) : null}
    </AdviserLayout>
  )
}
