import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import GapOverviewPanel from '../../components/GapOverviewPanel.jsx'
import {
  getProjectTraceData,
  setSelectedProjectId,
} from '../../utils/adviserProjects.js'
import { getAdviserProject } from '../../utils/adviserTeams.js'
import '../HubPage.css'
import './AdviserPages.css'
import '../Continuity.css'

const gapTypeLabels = {
  'sdd-mapping': 'Missing SDD Elements',
  'test-case': 'Missing Test Cases',
  implementation: 'Unimplemented Modules',
  'planning-trace': 'Planning Gaps',
  'requirement-trace': 'Requirement Trace Gaps',
}

export default function AdviserContinuity() {
  const { projectId } = useParams()
  const project = getAdviserProject(projectId)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (project) setSelectedProjectId(project.id)
  }, [project])

  if (!project) {
    return <Navigate to="/adviser/dashboard" replace />
  }

  const trace = getProjectTraceData(project)
  const gaps = trace.mappingResult.gaps

  const grouped = {
    'sdd-mapping': gaps.filter((g) => g.type === 'sdd-mapping'),
    'test-case': gaps.filter((g) => g.type === 'test-case'),
    implementation: gaps.filter((g) => g.type === 'implementation'),
    'planning-trace': gaps.filter((g) => g.type === 'planning-trace'),
    'requirement-trace': gaps.filter((g) => g.type === 'requirement-trace'),
  }

  const severityOrder = ['high', 'medium', 'low']
  const filtered = activeFilter === 'all'
    ? gaps
    : gaps.filter((g) => g.type === activeFilter)

  const sorted = [...filtered].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  )

  return (
    <AdviserLayout>
      <div className="hub-page adviser-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon hub-banner__icon--chain">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h1 className="hub-banner__title">Continuity Analysis Report</h1>
              <p className="hub-banner__subtitle">Team {project.teamCode} · severity-ranked gap report</p>
            </div>
          </div>
        </header>

        <GapOverviewPanel
          gaps={gaps}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          interactive
        />

        <div className="adviser-two-col">
          {Object.entries(grouped).map(([type, items]) => (
            items.length > 0 ? (
              <section key={type} className="card" style={{ padding: '20px 24px' }}>
                <h2 className="adviser-section-title">{gapTypeLabels[type] ?? type} ({items.length})</h2>
                <ul className="adviser-gap-list">
                  {items.slice(0, 4).map((gap) => (
                    <li key={gap.id} className={`adviser-gap-item adviser-gap-item--${gap.severity}`}>
                      <p className="adviser-gap-item__title">{gap.title}</p>
                      <p className="adviser-gap-item__meta">{gap.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          ))}
        </div>

        <section className="card continuity-issues" style={{ marginBottom: 16 }}>
          <div className="continuity-issues__head">
            <div>
              <h2 className="continuity-issues__title">Severity Ranking</h2>
              <p className="continuity-issues__subtitle">All gaps sorted by priority</p>
            </div>
            <span className="continuity-issues__count">{sorted.length} total</span>
          </div>
          <div className="continuity-issues__groups" style={{ maxHeight: 'none', padding: '12px 20px 20px' }}>
            <ul className="continuity-issues__list">
              {sorted.map((gap, index) => (
                <li key={gap.id}>
                  <div className="continuity-issue" style={{ cursor: 'default' }}>
                    <div className="continuity-issue__top">
                      <span className="continuity-issue__type">#{index + 1}</span>
                      <span className={`continuity-issue__severity continuity-issue__severity--${gap.severity}`}>
                        {gap.severity}
                      </span>
                    </div>
                    <p className="continuity-issue__title">{gap.title}</p>
                    <p className="continuity-issue__component">{gap.component} · {gap.fix}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="adviser-actions">
          <Link to={`/adviser/evaluation/${project.id}`} className="adviser-btn adviser-btn--primary">
            Add Evaluation Remarks
          </Link>
          <Link to={`/adviser/review/${project.id}`} className="adviser-btn adviser-btn--outline">
            Back to Project Review
          </Link>
        </div>
      </div>
    </AdviserLayout>
  )
}
