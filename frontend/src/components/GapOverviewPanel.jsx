import { analysisSnapshot, mappingResult } from '../utils/traceability.js'
import './GapOverviewPanel.css'

const continuityStatusMeta = {
  verified: { label: 'Verified Continuity', className: 'verified' },
  partial: { label: 'Partial Continuity', className: 'partial' },
  broken: { label: 'Broken Continuity', className: 'broken' },
}

const statCards = [
  { key: 'all', label: 'Total Gaps', tone: 'total' },
  { key: 'sdd-mapping', label: 'SDD Mapping', tone: 'sdd' },
  { key: 'test-case', label: 'Test Cases', tone: 'test' },
  { key: 'implementation', label: 'Implementation', tone: 'code' },
  { key: 'planning-trace', label: 'Planning', tone: 'plan' },
]

function getFilterCount(key, gaps = mappingResult.gaps) {
  if (key === 'all') return gaps.length
  return gaps.filter((link) => link.type === key).length
}

function getSeverityCount(severity, gaps = mappingResult.gaps) {
  return gaps.filter((link) => link.severity === severity).length
}

export default function GapOverviewPanel({
  gaps = mappingResult.gaps,
  activeFilter,
  onFilterChange,
  interactive = false,
}) {
  const status = continuityStatusMeta[analysisSnapshot.continuityStatus] ?? continuityStatusMeta.partial
  const StatTag = interactive ? 'button' : 'div'

  return (
    <section className="gap-overview card">
      <div className="gap-overview__status">
        <span className={`gap-overview__badge gap-overview__badge--${status.className}`}>
          {status.label}
        </span>
        <h2 className="gap-overview__title">
          {gaps.length} gap{gaps.length !== 1 ? 's' : ''} found in your lifecycle chain
        </h2>
        <p className="gap-overview__text">
          Each gap shows where a requirement, design, test, or code link is missing.
          Start with high-priority issues, then update your artifacts and re-run analysis.
        </p>
        <div className="gap-overview__severity">
          <span className="gap-overview__severity-pill gap-overview__severity-pill--high">
            {getSeverityCount('high', gaps)} High
          </span>
          <span className="gap-overview__severity-pill gap-overview__severity-pill--medium">
            {getSeverityCount('medium', gaps)} Medium
          </span>
          <span className="gap-overview__severity-pill gap-overview__severity-pill--low">
            {getSeverityCount('low', gaps)} Low
          </span>
        </div>
      </div>

      <div className="gap-overview__stats">
        {statCards.map((stat) => (
          <StatTag
            key={stat.key}
            type={interactive ? 'button' : undefined}
            className={`gap-stat gap-stat--${stat.tone}${interactive && activeFilter === stat.key ? ' gap-stat--active' : ''}`}
            onClick={interactive ? () => onFilterChange?.(stat.key) : undefined}
          >
            <span className="gap-stat__value">{getFilterCount(stat.key, gaps)}</span>
            <span className="gap-stat__label">{stat.label}</span>
          </StatTag>
        ))}
      </div>
    </section>
  )
}
