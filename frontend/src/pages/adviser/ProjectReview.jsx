import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import { PageBanner } from '../../components/PageBanner.jsx' 
import ComponentTraceModal from '../../components/ComponentTraceModal.jsx'
import GapOverviewPanel from '../../components/GapOverviewPanel.jsx'
import {
  artifactColumns,
  computeComponentTraceabilityScore,
  getCoverageStatus,
} from '../../utils/traceability.js'
import {
  getProjectTraceData,
  getReviewStatusMeta,
  setSelectedProjectId,
} from '../../utils/adviserProjects.js'
import { getAdviserProject, getSubmissionsForProject } from '../../utils/adviserTeams.js'
import { formatSubmissionIdentity } from '../../utils/adviserSubmissions.js'
import '../HubPage.css'
import './AdviserPages.css'

const artifactLabels = ['Proposal', 'SRS', 'SDD', 'SPMP', 'STD', 'Code']

const DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'traceability', label: 'Traceability' },
]

function scoreTone(score) {
  if (score >= 80) return 'green'
  if (score >= 60) return 'amber'
  return 'red'
}

export default function ProjectReview() {
  const { projectId } = useParams()
  const project = getAdviserProject(projectId)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedComponentId, setSelectedComponentId] = useState(null)

  useEffect(() => {
    if (project) setSelectedProjectId(project.id)
  }, [project])

  if (!project) {
    return <Navigate to="/adviser/dashboard" replace />
  }

  const trace = getProjectTraceData(project)
  const status = getReviewStatusMeta(project.reviewStatus)
  const components = trace.components ?? []
  const submissions = getSubmissionsForProject(project)
  const fullyTraced = components.filter((c) => getCoverageStatus(c) === 'full').length
  const evalScore = project.traceabilityScore

  return (
    <AdviserLayout>
      <div className="hub-page adviser-page adviser-team-detail">
        
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          tag={`TEAM ${project.teamCode} · ${project.section?.toUpperCase()}`}
          title={project.title}
          subtitle={`${project.course} · Last submitted ${project.lastSubmitted}`}
          rightElement={
            <span className={`adviser-status-pill adviser-status-pill--${status.tone} adviser-team-detail__status`}>
              {status.label}
            </span>
          }
        />

        <div className="adviser-team-detail__metrics">
          <div className={`adviser-team-detail__metric adviser-team-detail__metric--${scoreTone(project.traceabilityScore)}`}>
            <span className="adviser-team-detail__metric-value">{project.traceabilityScore}%</span>
            <span className="adviser-team-detail__metric-label">Traceability Score</span>
          </div>
          <div className="adviser-team-detail__metric adviser-team-detail__metric--red">
            <span className="adviser-team-detail__metric-value">{trace.mappingResult.stats?.gapCount ?? project.gapCount}</span>
            <span className="adviser-team-detail__metric-label">Gaps Found</span>
          </div>
          <div className="adviser-team-detail__metric adviser-team-detail__metric--blue">
            <span className="adviser-team-detail__metric-value">{project.artifactsUploaded}/{project.artifactsTotal}</span>
            <span className="adviser-team-detail__metric-label">Artifacts</span>
          </div>
          <div className={`adviser-team-detail__metric adviser-team-detail__metric--${scoreTone(evalScore)} adviser-team-detail__metric--featured`}>
            <span className="adviser-team-detail__metric-value">{evalScore}</span>
            <span className="adviser-team-detail__metric-label">Evaluation Score</span>
          </div>
        </div>

        <div className="adviser-team-detail__tabs" role="tablist" aria-label="Team detail views">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`adviser-team-detail__tab${activeTab === tab.id ? ' adviser-team-detail__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="adviser-team-detail__panel">
            <div className="adviser-two-col">
              <section className="card adviser-team-detail__card">
                <h2 className="adviser-section-title">Project Info</h2>
                <ul className="adviser-info-list">
                  <li><span>Section</span><strong>{project.section?.toUpperCase() ?? '—'}</strong></li>
                  <li><span>Team Code</span><strong>Team {project.teamCode}</strong></li>
                  <li><span>Course</span><strong>{project.course}</strong></li>
                  <li><span>Semester</span><strong>{project.semester}</strong></li>
                  <li><span>Continuity</span><strong style={{ textTransform: 'capitalize' }}>{project.continuityStatus}</strong></li>
                </ul>
              </section>

              <section className="card adviser-team-detail__card">
                <h2 className="adviser-section-title">Team Members</h2>
                <ul className="adviser-team-detail__members">
                  {project.members.map((member) => (
                    <li key={member.name} className="adviser-team-detail__member">
                      <span className="adviser-team-detail__member-avatar">
                        {member.name.charAt(0)}
                      </span>
                      <div>
                        <p className="adviser-team-detail__member-name">{member.name}</p>
                        <p className="adviser-team-detail__member-role">{member.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="card adviser-team-detail__card">
              <h2 className="adviser-section-title">SMART Goals</h2>
              <ul className="adviser-goals">
                {project.smartGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </section>

            <section className="card adviser-team-detail__card">
              <h2 className="adviser-section-title">Uploaded Artifacts</h2>
              <ul className="adviser-artifact-grid">
                {artifactLabels.map((label, index) => {
                  const uploaded = index < project.artifactsUploaded
                  return (
                    <li key={label} className={`adviser-artifact${uploaded ? ' adviser-artifact--done' : ''}`}>
                      <p className="adviser-artifact__abbr">{label}</p>
                      <p className="adviser-artifact__status">{uploaded ? 'Uploaded' : 'Missing'}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        ) : null}

        {activeTab === 'traceability' ? (
          <div className="adviser-team-detail__panel">
            <GapOverviewPanel gaps={trace.mappingResult.gaps} />

            {components.length > 0 ? (
              <section className="card adviser-team-detail__card">
                <div className="adviser-team-detail__card-head">
                  <div>
                    <h2 className="adviser-section-title">Traceability Matrix</h2>
                    <p className="adviser-team-detail__card-desc">
                      {fullyTraced} of {components.length} components fully traced across IEEE artifacts.
                    </p>
                  </div>
                </div>
                <div className="adviser-dashboard__table-scroll">
                  <table className="adviser-project-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        {artifactColumns.map((col) => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <button
                              type="button"
                              className="adviser-matrix-component-link"
                              onClick={() => setSelectedComponentId(row.id)}
                            >
                              {row.name}
                            </button>
                          </td>
                          {artifactColumns.map((col) => (
                            <td key={col.key}>
                              <span className={`adviser-matrix-cell${row.mapping[col.key] ? ' adviser-matrix-cell--ok' : ' adviser-matrix-cell--missing'}`}>
                                {row.mapping[col.key] ? '✓' : '✕'}
                              </span>
                            </td>
                          ))}
                          <td>{computeComponentTraceabilityScore(row)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="adviser-matrix-tip">
                  Click a <strong>component name</strong> to open its traceability evaluation report.
                </p>
              </section>
            ) : null}

            {submissions.length > 0 ? (
              <section className="card adviser-dashboard__table-wrap">
                <div className="adviser-team-detail__card-head" style={{ padding: '20px 24px 0' }}>
                  <div>
                    <h2 className="adviser-section-title">Artifact Submissions</h2>
                    <p className="adviser-team-detail__card-desc">
                      Uploads processed by the AI extraction pipeline.
                    </p>
                  </div>
                </div>
                <div className="adviser-dashboard__table-scroll">
                  <table className="adviser-submission-table">
                    <thead>
                      <tr>
                        <th>Submission</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Analysis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="adviser-submission-table__identity">
                            {formatSubmissionIdentity(sub)}
                          </td>
                          <td>{sub.submissionType}</td>
                          <td className="adviser-submission-table__date">{sub.submittedAt}</td>
                          <td>
                            <span className={`adviser-status-pill adviser-status-pill--${sub.analyzed ? 'green' : 'amber'}`}>
                              {sub.analyzed ? 'Analyzed' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="card adviser-team-detail__card adviser-team-detail__card--flush">
              <div className="adviser-team-detail__card-head" style={{ padding: '20px 24px 0' }}>
                <h2 className="adviser-section-title">Gap Details</h2>
              </div>
              <div className="adviser-dashboard__table-scroll">
                <table className="adviser-gap-table">
                  <thead>
                    <tr>
                      <th>Gap</th>
                      <th>Component</th>
                      <th>Link</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trace.mappingResult.gaps.slice(0, 8).map((gap) => (
                      <tr key={gap.id} className={`adviser-gap-table__row adviser-gap-table__row--${gap.severity}`}>
                        <td className="adviser-gap-table__gap">{gap.title}</td>
                        <td>{gap.component}</td>
                        <td className="adviser-gap-table__link">{gap.from} → {gap.to}</td>
                        <td>
                          <span className={`adviser-gap-table__severity adviser-gap-table__severity--${gap.severity}`}>
                            {gap.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
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