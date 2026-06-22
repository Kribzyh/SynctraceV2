import DashboardLayout from '../components/DashboardLayout.jsx'
import { analysisSnapshot } from '../utils/traceability.js'
import './HubPage.css'
import './Reports.css'

const reports = [
  {
    id: 'traceability',
    title: 'Traceability Report',
    format: 'PDF',
    description: 'Full component-level mapping across Proposal through Code.',
    updated: analysisSnapshot.analyzedAt,
  },
  {
    id: 'continuity',
    title: 'Continuity Report',
    format: 'PDF',
    description: 'Missing lifecycle links between SRS, SDD, STD, and implementation.',
    updated: analysisSnapshot.analyzedAt,
  },
  {
    id: 'coverage',
    title: 'Component Coverage Report',
    format: 'PDF',
    description: 'Per-component trace status, SMART goal links, and evidence summary.',
    updated: analysisSnapshot.analyzedAt,
  },
  {
    id: 'evaluation',
    title: 'Adviser Evaluation Report',
    format: 'PDF',
    description: 'Combined AI evaluation feedback ready for adviser review.',
    updated: analysisSnapshot.analyzedAt,
  },
]

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="hub-page reports-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="hub-banner__title">Reports</h1>
              <p className="hub-banner__subtitle banner-accent-line--with-text">
                <span className="banner-accent-line" aria-hidden="true" />
                Download exportable traceability and continuity documents.
              </p>
            </div>
          </div>
        </header>

        <div className="reports-grid">
          {reports.map((report) => (
            <article key={report.id} className="hub-card report-card">
              <div className="report-card__top">
                <h3>{report.title}</h3>
                <span className="report-card__format">{report.format}</span>
              </div>
              <p className="report-card__desc">{report.description}</p>
              <p className="report-card__updated">Updated {report.updated}</p>
              <button type="button" className="hub-btn hub-btn--primary report-card__btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download {report.format}
              </button>
            </article>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
