import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PageBanner } from '../components/PageBanner.jsx' 
import './HubPage.css'
import './Gap.css'

const issues = [
  {
    id: 1,
    severity: 'high',
    confidence: 93,
    reportedAt: 'May 22, 2026',
    summary: 'SDD lacks explicit implementation details for SRS performance metrics.',
    docs: ['Requirements (SRS)', 'Design (SDD)'],
    found: 'While "Real-time Data Synchronization" is referenced in the SDD, there is no architectural proof demonstrating how the 2-second SSE latency requirement from the SRS will be met.',
    reason: 'The SDD focuses heavily on component structure and class diagrams but omits operational benchmarks and performance validation strategies.',
    fix: 'Update the SDD with a Performance & Scalability section that maps each SRS non-functional requirement to a measurable design decision, including SSE connection pooling and latency monitoring.',
  },
  {
    id: 2,
    severity: 'medium',
    confidence: 87,
    reportedAt: 'May 23, 2026',
    summary: 'SDD does not address SRS usability requirements.',
    docs: ['Requirements (SRS)', 'Design (SDD)'],
    found: 'SRS defines accessibility and responsive layout requirements for the student portal, but the SDD wireframes and module specs do not reference WCAG compliance or mobile breakpoints.',
    reason: 'Usability requirements were added to the SRS after the initial SDD draft was approved.',
    fix: 'Add a Usability & Accessibility subsection to the SDD that maps each SRS usability requirement to UI components and acceptance criteria.',
  },
  {
    id: 3,
    severity: 'medium',
    confidence: 76,
    reportedAt: 'May 24, 2026',
    summary: 'Missing comprehensive STD Test Cases for error handling in Auth Controller.',
    docs: ['Design (SDD)', 'Testing (STD)'],
    found: 'The AuthController in the SDD specifies returning 401 Unauthorized for expired tokens, but the STD only contains test cases for Invalid Credentials.',
    reason: 'Test case generation during Sprint 1 may have been cut short, missing JWT token lifecycle and expiration edge cases.',
    fix: 'Add a new test suite in your STD covering Token Expiry, Malformed Tokens, and Missing Authorization Headers.',
  },
  {
    id: 4,
    severity: 'low',
    confidence: 98,
    reportedAt: 'May 25, 2026',
    summary: 'Minor formatting inconsistencies in SPMP milestone dates.',
    docs: ['Project Mgmt (SPMP)'],
    found: 'Sprint milestone dates in the SPMP use mixed formats (MM/DD/YYYY and Month DD, YYYY), which may cause confusion during progress tracking.',
    reason: 'The SPMP was assembled from multiple team submissions without a final formatting pass.',
    fix: 'Standardize all milestone dates to a single format and align sprint boundaries with the SDD module delivery schedule.',
  },
]

const severityOrder = ['critical', 'high', 'medium', 'low']

function getSeverityCount(severity) {
  return issues.filter((issue) => issue.severity === severity).length
}

export default function Gap() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(3)

  const filtered = useMemo(
    () => (activeFilter === 'all'
      ? issues
      : issues.filter((issue) => issue.severity === activeFilter)),
    [activeFilter],
  )

  const filters = useMemo(() => ([
    { key: 'all', label: 'All', count: issues.length },
    ...severityOrder.map((level) => ({
      key: level,
      label: level.charAt(0).toUpperCase() + level.slice(1),
      count: getSeverityCount(level),
    })),
  ]), [])

  const severitySummary = useMemo(() => ([
    { level: 'critical', label: 'Critical', count: getSeverityCount('critical'), color: 'red' },
    { level: 'high', label: 'High', count: getSeverityCount('high'), color: 'orange' },
    { level: 'medium', label: 'Medium', count: getSeverityCount('medium'), color: 'yellow' },
    { level: 'low', label: 'Low', count: getSeverityCount('low'), color: 'blue' },
  ]), [])

  const selected = issues.find((issue) => issue.id === selectedId) ?? issues[0]

  useEffect(() => {
    if (!filtered.some((issue) => issue.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? issues[0].id)
    }
  }, [filtered, selectedId])

  return (
    <DashboardLayout>
      <div className="gap-page">
        
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="M12 11h4"/>
              <path d="M12 16h4"/>
              <path d="M8 11h.01"/>
              <path d="M8 16h.01"/>
            </svg>
          }
          title="Gap Analysis"
          subtitle="Review problems found in your documents and follow the suggested fixes."
        />

        <div className="gap-summary">
          {severitySummary.map((item) => (
            <div key={item.level} className={`gap-summary__card gap-summary__card--${item.color}`}>
              <span className="gap-summary__count">{item.count}</span>
              <span className="gap-summary__label">{item.label}</span>
              <span className="gap-summary__sub">issues found</span>
            </div>
          ))}
        </div>

        <div className="gap-grid">
          <section className="card gap-issues">
            <div className="gap-issues__header">
              <h2 className="gap-issues__title">Issues</h2>
              <span className="gap-issues__count">{filtered.length} of {issues.length} shown</span>
            </div>

            <div className="gap-filters" role="tablist" aria-label="Filter issues by severity">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === f.key}
                  className={`gap-filter${activeFilter === f.key ? ' gap-filter--active' : ''}`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <ul className="gap-issues__list">
              {filtered.map((issue) => (
                <li key={issue.id}>
                  <button
                    type="button"
                    className={`gap-issue-card gap-issue-card--${issue.severity}${selectedId === issue.id ? ' gap-issue-card--selected' : ''}`}
                    onClick={() => setSelectedId(issue.id)}
                  >
                    <div className="gap-issue-card__top">
                      <span className={`gap-severity gap-severity--${issue.severity}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="gap-issue-card__confidence">{issue.confidence}% confidence</span>
                    </div>
                    <p className="gap-issue-card__summary">{issue.summary}</p>
                    <div className="gap-issue-card__docs">
                      {issue.docs.map((doc) => (
                        <span key={doc} className="gap-doc-tag">{doc}</span>
                      ))}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="card gap-detail">
            <div className="gap-detail__header">
              <span className="gap-detail__label">ISSUE ANALYSIS</span>
              <div className="gap-detail__meta">
                <span className={`gap-severity gap-severity--${selected.severity}`}>
                  {selected.severity.toUpperCase()}
                </span>
                {selected.docs.map((doc) => (
                  <span key={doc} className="gap-doc-tag">{doc}</span>
                ))}
                <span className="gap-detail__date">{selected.reportedAt}</span>
              </div>
            </div>

            <section className="gap-detail__section">
              <h3>What Was Found</h3>
              <p>{selected.found}</p>
            </section>

            <section className="gap-detail__box gap-detail__box--why">
              <h3>Why this happened</h3>
              <p>{selected.reason}</p>
            </section>

            <section className="gap-detail__box gap-detail__box--fix">
              <h3>Suggested fix</h3>
              <p>{selected.fix}</p>
              <button type="button" className="gap-fix-btn">Acknowledge &amp; Fix Issue</button>
            </section>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}