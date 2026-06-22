import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PageBanner } from '../components/PageBanner.jsx' 
import {
  artifactDefinitions,
  getArtifactStatus,
  loadArtifacts,
} from '../utils/artifacts.js'
import { getProject } from '../utils/session.js'
import { analysisSnapshot } from '../utils/traceability.js'
import './Dashboard.css'

const continuityLabels = {
  verified: { label: 'Verified', tone: 'green', desc: 'Lifecycle chain is fully connected' },
  partial: { label: 'Partial Continuity', tone: 'amber', desc: 'Some artifact links need attention' },
  broken: { label: 'Continuity Broken', tone: 'red', desc: 'Critical gaps across the lifecycle chain' },
}

const continuityChecks = [
  { id: 'proposal-srs', label: 'Proposal → SRS', status: 'verified' },
  { id: 'srs-sdd-code', label: 'SRS → SDD → Code', status: 'partial' },
  { id: 'srs-std', label: 'SRS → STD test coverage', status: 'partial' },
]

export default function Dashboard() {
  const project = getProject()
  const artifacts = loadArtifacts()
  const snapshot = analysisSnapshot
  const projectTitle = project?.title ?? 'SyncTrace'
  const teamCode = project?.teamCode ?? '—'
  const teamRole = project?.teamRole === 'member' ? 'Member' : 'Leader'
  const continuity = continuityLabels[snapshot.continuityStatus] ?? continuityLabels.partial

  const artifactProgress = artifactDefinitions.map((def) => {
    const artifact = artifacts.find((a) => a.id === def.id)
    const status = getArtifactStatus(artifact)
    return { ...def, status, version: artifact?.activeVersion ?? 0 }
  })

  const uploadedCount = artifactProgress.filter((a) => a.status === 'uploaded').length
  const uploadPercent = Math.round((uploadedCount / artifactDefinitions.length) * 100)

  return (
    <DashboardLayout>
      <div className="dashboard">
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          title="Project Overview"
          subtitle="Monitor traceability score, continuity status, and artifact progress at a glance."
        />

        <section className="card dashboard-project">
          <div className="dashboard-project__main">
            <p className="dashboard-project__eyebrow">Active Capstone Project</p>
            <h2 className="dashboard-project__title">{projectTitle}</h2>
            <p className="dashboard-project__meta">Team {teamCode}</p>
          </div>
          <div className="dashboard-project__role">
            <span className={`dashboard-role dashboard-role--${teamRole.toLowerCase()}`}>
              {teamRole}
            </span>
          </div>
        </section>

        <section className="dashboard-metrics">
          <div className="card dashboard-metric dashboard-metric--hero">
            <div
              className="dashboard-metric__ring"
              style={{ '--score': snapshot.traceabilityScore }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 80 80">
                <circle className="dashboard-metric__ring-track" cx="40" cy="40" r="34" />
                <circle className="dashboard-metric__ring-fill" cx="40" cy="40" r="34" />
              </svg>
              <span className="dashboard-metric__ring-value">{snapshot.traceabilityScore}%</span>
            </div>
            <div>
              <p className="dashboard-metric__label">Traceability Score</p>
              <div className="dashboard-metric__progress">
                <div style={{ width: `${snapshot.traceabilityScore}%` }} />
              </div>
              <p className="dashboard-metric__sub">Last analyzed {snapshot.analyzedAt}</p>
            </div>
          </div>

          <div className="card dashboard-metric">
            <p className="dashboard-metric__label">Continuity Status</p>
            <span className={`dashboard-continuity dashboard-continuity--${continuity.tone}`}>
              {continuity.label}
            </span>
            <p className="dashboard-metric__sub">{continuity.desc}</p>
          </div>

          <div className="card dashboard-metric">
            <p className="dashboard-metric__label">Open Gaps</p>
            <p className="dashboard-metric__value dashboard-metric__value--red">{snapshot.gapCount}</p>
            <p className="dashboard-metric__sub">Missing lifecycle links detected</p>
            <Link to="/continuity" className="dashboard-metric__link">
              View Gap Analysis →
            </Link>
          </div>

          <div className="card dashboard-metric">
            <p className="dashboard-metric__label">Artifacts Ready</p>
            <p className="dashboard-metric__value">{uploadedCount}/{artifactDefinitions.length}</p>
            <p className="dashboard-metric__sub">{uploadPercent}% of IEEE documents uploaded</p>
            <Link to="/artifacts" className="dashboard-metric__link">
              Manage Uploads →
            </Link>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="card dashboard-analysis">
            <div className="dashboard-analysis__header">
              <div>
                <p className="dashboard-section__eyebrow">AI Engine</p>
                <h3 className="dashboard-section__title">Latest Extraction Run</h3>
                <p className="dashboard-analysis__date">Analyzed on {snapshot.analyzedAt}</p>
              </div>
              <Link to="/matrix" className="dashboard-action dashboard-action--primary">
                View Matrix
              </Link>
            </div>

            <p className="dashboard-analysis__summary">
              Traceability score is <strong>{snapshot.traceabilityScore}%</strong> with{' '}
              <strong>{snapshot.gapCount}</strong> missing links across your component lifecycle.
              {uploadedCount < artifactDefinitions.length
                ? ` Upload ${artifactDefinitions.length - uploadedCount} more artifact${artifactDefinitions.length - uploadedCount !== 1 ? 's' : ''} to improve coverage.`
                : ' All required artifacts are uploaded.'}
            </p>

            <ul className="dashboard-analysis__checks">
              {continuityChecks.map((check) => (
                <li key={check.id} className={`dashboard-check dashboard-check--${check.status}`}>
                  <span className="dashboard-check__icon" aria-hidden="true">
                    {check.status === 'verified' ? '✓' : '!'}
                  </span>
                  <span className="dashboard-check__label">{check.label}</span>
                  <span className="dashboard-check__status">{check.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card dashboard-artifacts">
            <div className="dashboard-artifacts__header">
              <div>
                <p className="dashboard-section__eyebrow">IEEE Artifacts</p>
                <h3 className="dashboard-section__title">Upload Progress</h3>
              </div>
              <Link to="/artifacts" className="dashboard-metric__link">Upload →</Link>
            </div>

            <ul className="dashboard-artifacts__grid">
              {artifactProgress.map((item) => (
                <li
                  key={item.id}
                  className={`dashboard-artifact${item.status === 'uploaded' ? ' dashboard-artifact--done' : ''}`}
                >
                  <div className="dashboard-artifact__top">
                    <span className="dashboard-artifact__abbr">{item.abbr}</span>
                    <span className={`dashboard-artifact__badge dashboard-artifact__badge--${item.status}`}>
                      {item.status === 'uploaded' ? `v${item.version}` : 'Missing'}
                    </span>
                  </div>
                  <p className="dashboard-artifact__title">{item.title}</p>
                  <div className="dashboard-artifact__bar">
                    <div style={{ width: item.status === 'uploaded' ? '100%' : '0%' }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}