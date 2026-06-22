import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import { PageBanner } from '../../components/PageBanner.jsx' 
import AdviserTeamCard from '../../components/AdviserTeamCard.jsx'
import {
  adviserSections,
  adviserTeamCodes,
} from '../../utils/adviserSubmissions.js'
import { buildAdviserTeams, filterAdviserTeams } from '../../utils/adviserTeams.js'
import { setSelectedProjectId } from '../../utils/adviserProjects.js'
import '../HubPage.css'
import './AdviserPages.css'

export default function AdviserDashboard() {
  const navigate = useNavigate()
  const [section, setSection] = useState('all')
  const [teamCode, setTeamCode] = useState('all')

  const teams = useMemo(() => buildAdviserTeams(), [])

  const filteredTeams = useMemo(
    () => filterAdviserTeams(teams, { section, teamCode, docType: 'all' }),
    [teams, section, teamCode],
  )

  const pendingCount = useMemo(
    () => teams.filter((team) => team.status === 'pending').length,
    [teams],
  )

  const revisionCount = useMemo(
    () => teams.filter((team) => team.status === 'needs_revision').length,
    [teams],
  )

  function openTeam(projectId) {
    setSelectedProjectId(projectId)
    navigate(`/adviser/review/${projectId}`)
  }

  return (
    <AdviserLayout>
      <div className="adviser-page adviser-dashboard">
        
        <PageBanner
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          tag="CAPSTONE ADVISER PORTAL"
          title="Adviser Dashboard"
          subtitle="Review capstone teams and open a project to inspect traceability health."
          rightElement={
            <div className="adviser-dashboard__hero-stats">
              <div className="adviser-dashboard__hero-stat">
                <span className="adviser-dashboard__hero-stat-value">{filteredTeams.length}</span>
                <span className="adviser-dashboard__hero-stat-label">Teams</span>
              </div>
              <div className="adviser-dashboard__hero-stat">
                <span className="adviser-dashboard__hero-stat-value">{pendingCount}</span>
                <span className="adviser-dashboard__hero-stat-label">Pending</span>
              </div>
              <div className="adviser-dashboard__hero-stat">
                <span className="adviser-dashboard__hero-stat-value">{revisionCount}</span>
                <span className="adviser-dashboard__hero-stat-label">Needs Revision</span>
              </div>
            </div>
          }
        />

        <section className="card adviser-dashboard__toolbar">
          <div className="adviser-dashboard__toolbar-filters">
            <p className="adviser-dashboard__filters-title">Filter Teams</p>
            <div className="adviser-dashboard__filters">
              <div className="adviser-dashboard__filter">
                <label htmlFor="adviser-section">Section</label>
                <select
                  id="adviser-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  {adviserSections.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="adviser-dashboard__filter">
                <label htmlFor="adviser-team">Team Code</label>
                <select
                  id="adviser-team"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                >
                  {adviserTeamCodes.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="adviser-dashboard__team-count" aria-live="polite">
            <span className="adviser-dashboard__team-count-value">{filteredTeams.length}</span>
            <span className="adviser-dashboard__team-count-label">Teams</span>
          </div>
        </section>

        <div className="adviser-dashboard__list-head">
          <h2 className="adviser-dashboard__list-title">Assigned Teams</h2>
          <p className="adviser-dashboard__list-sub">
            {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} available for review
          </p>
        </div>

        <section className="adviser-dashboard__team-list">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <AdviserTeamCard key={team.id} team={team} onOpen={openTeam} />
            ))
          ) : (
            <div className="card adviser-dashboard__empty">
              No teams match your filters.
            </div>
          )}
        </section>
      </div>
    </AdviserLayout>
  )
}