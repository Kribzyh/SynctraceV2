function scoreTone(score) {
  if (score >= 80) return 'green'
  if (score >= 60) return 'amber'
  return 'red'
}

function formatTeamRef(section, teamCode) {
  return `#2526-SEM2-${section.toUpperCase()}-${teamCode.padStart(2, '0')}`
}

const statusLabels = {
  approved: 'Ready',
  pending: 'Pending',
  needs_revision: 'Revision',
}

export default function AdviserTeamCard({ team, onOpen }) {
  const tone = scoreTone(team.traceabilityScore)
  const statusLabel = statusLabels[team.status] ?? team.statusMeta.label

  return (
    <article className="adviser-team-card card">
      <button type="button" className="adviser-team-card__main" onClick={() => onOpen(team.projectId)}>
        <div
          className={`adviser-team-card__ring adviser-team-card__ring--${tone}`}
          style={{ '--score': team.traceabilityScore }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 80 80">
            <circle className="adviser-team-card__ring-track" cx="40" cy="40" r="34" />
            <circle className="adviser-team-card__ring-fill" cx="40" cy="40" r="34" />
          </svg>
          <span className="adviser-team-card__ring-value">{team.traceabilityScore}%</span>
        </div>

        <div className="adviser-team-card__body">
          <div className="adviser-team-card__title-row">
            <h2 className="adviser-team-card__title">{team.title}</h2>
            <span className="adviser-team-card__ref">{formatTeamRef(team.section, team.teamCode)}</span>
          </div>
          <p className="adviser-team-card__subtitle">{team.course}</p>

          <div className="adviser-team-card__meta">
            <span className={`adviser-team-card__status adviser-team-card__status--${team.statusMeta.tone}`}>
              <span className="adviser-team-card__status-dot" aria-hidden="true" />
              {statusLabel}
            </span>
            {team.gapCount > 0 ? (
              <span className="adviser-team-card__warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                {team.gapCount} warning{team.gapCount !== 1 ? 's' : ''}
              </span>
            ) : null}
            <span className="adviser-team-card__date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {team.lastSubmitted}
            </span>
          </div>
        </div>
      </button>

      <div className="adviser-team-card__aside">
        <span className="adviser-team-card__avatar" title={team.leaderName}>
          {team.leaderInitial}
        </span>
        <button
          type="button"
          className="adviser-team-card__go"
          onClick={() => onOpen(team.projectId)}
          aria-label={`Open ${team.title}`}
        >
          ›
        </button>
      </div>
    </article>
  )
}
