import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import {
  artifactColumns,
  computeComponentGapCount,
  computeComponentTraceabilityScore,
  getComponent,
} from '../../utils/traceability.js'
import {
  getAssignedProject,
  getProjectTraceData,
  setSelectedProjectId,
} from '../../utils/adviserProjects.js'
import '../HubPage.css'
import './AdviserPages.css'

export default function ComponentInspection() {
  const { projectId, componentId } = useParams()
  const project = getAssignedProject(projectId)

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
              <div className="hub-banner__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></div>
              <div>
                <h1 className="hub-banner__title">Component Inspection</h1>
                <p className="hub-banner__subtitle">Team {project.teamCode}</p>
              </div>
            </div>
          </header>
          <section className="card" style={{ padding: 24 }}>
            <p style={{ margin: 0, color: '#6b7280' }}>Full component data available for Team 16 (SyncTrace demo project).</p>
          </section>
        </div>
      </AdviserLayout>
    )
  }

  if (componentId) {
    const component = getComponent(componentId)
    if (!component) {
      return <Navigate to={`/adviser/inspection/${project.id}`} replace />
    }

    const { evaluation } = component
    const missingArtifacts = artifactColumns.filter((col) => !component.mapping[col.key])

    return (
      <AdviserLayout>
        <div className="hub-page adviser-page">
          <header className="hub-banner">
            <div className="hub-banner__left">
              <div className="hub-banner__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></div>
              <div>
                <h1 className="hub-banner__title">{component.name}</h1>
                <p className="hub-banner__subtitle">{component.smartGoal}</p>
              </div>
            </div>
          </header>

          <div className="adviser-metrics" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="card adviser-metric">
              <span className="adviser-metric__value">{component.continuityScore}%</span>
              <span className="adviser-metric__label">Continuity Score</span>
            </div>
            <div className="card adviser-metric adviser-metric--red">
              <span className="adviser-metric__value">{component.gapCount}</span>
              <span className="adviser-metric__label">Missing Links</span>
            </div>
            <div className="card adviser-metric">
              <span className="adviser-metric__value">{artifactColumns.length - missingArtifacts.length}/{artifactColumns.length}</span>
              <span className="adviser-metric__label">Artifacts Mapped</span>
            </div>
          </div>

          {missingArtifacts.length > 0 ? (
            <section className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
              <h2 className="adviser-section-title">Missing Artifacts</h2>
              <ul className="adviser-gap-list">
                {missingArtifacts.map((col) => (
                  <li key={col.key} className="adviser-gap-item adviser-gap-item--high">
                    <p className="adviser-gap-item__title">No {col.label} mapping</p>
                    <p className="adviser-gap-item__meta">Component {component.name} is not traced to {col.label}.</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
            <h2 className="adviser-section-title">Lifecycle Trace Evaluation</h2>
            {evaluation.cards.map((card) => (
              <article
                key={card.id}
                className={`adviser-gap-item adviser-gap-item--${card.status === 'linked' ? 'low' : card.status === 'partial' ? 'medium' : 'high'}`}
                style={{ marginBottom: 10 }}
              >
                <p className="adviser-gap-item__title">{card.badge} — {card.title}</p>
                <p className="adviser-gap-item__meta" style={{ marginBottom: 8 }}>{card.notationObserved}</p>
                <p className="adviser-gap-item__meta"><strong>Issues:</strong> {card.issues.join(' ')}</p>
              </article>
            ))}
          </section>

          <div className="adviser-actions">
            <Link to={`/adviser/inspection/${project.id}`} className="adviser-btn adviser-btn--outline">All Components</Link>
            <Link to={`/adviser/matrix/${project.id}`} className="adviser-btn adviser-btn--primary">Matrix Viewer</Link>
          </div>
        </div>
      </AdviserLayout>
    )
  }

  return (
    <AdviserLayout>
      <div className="hub-page adviser-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></div>
            <div>
              <h1 className="hub-banner__title">Component Inspection</h1>
              <p className="hub-banner__subtitle">Team {project.teamCode} · select a component to inspect</p>
            </div>
          </div>
        </header>

        <div className="adviser-component-grid">
          {components.map((row) => (
            <Link
              key={row.id}
              to={`/adviser/inspection/${project.id}/${row.id}`}
              className="adviser-component-card"
            >
              <p className="adviser-component-card__name">{row.name}</p>
              <p className="adviser-component-card__goal">{row.smartGoal}</p>
              <span className="adviser-component-card__score">
                {computeComponentTraceabilityScore(row)}% continuity · {computeComponentGapCount(row)} gaps
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdviserLayout>
  )
}
