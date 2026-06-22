import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { capstoneAdvisers } from '../utils/advisers.js'
import { getProject, saveProject } from '../utils/session.js'
import './HubPage.css'
import './Workspace.css'

const defaultAdviser = capstoneAdvisers[0]

export default function Workspace() {
  const initial = getProject() ?? {}
  const [project, setProject] = useState({
    title: initial.title ?? 'SyncTrace',
    section: initial.section ?? 'IT411-02',
    teamCode: initial.teamCode ?? 'CITU-2026-A1',
    status: initial.status ?? 'In Progress',
    adviser: initial.adviser ?? defaultAdviser,
    members: initial.members ?? [],
    teamRole: initial.teamRole ?? 'leader',
  })
  const [memberEmail, setMemberEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLeader = project.teamRole !== 'member'

  function persist(next) {
    setProject(next)
    saveProject(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addMember() {
    const email = memberEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) return
    if (project.members.some((m) => m.email === email)) return
    persist({
      ...project,
      members: [...project.members, { email, name: email.split('@')[0] }],
    })
    setMemberEmail('')
  }

  function removeMember(email) {
    persist({
      ...project,
      members: project.members.filter((m) => m.email !== email),
    })
  }

  function handleSaveInfo() {
    persist({ ...project })
    setEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="hub-page workspace-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="hub-banner__title">Workspace</h1>
              <p className="hub-banner__subtitle banner-accent-line--with-text">
                <span className="banner-accent-line" aria-hidden="true" />
                Manage your capstone project details and team members.
              </p>
            </div>
          </div>
        </header>

        <div className="workspace-grid">
          <section className="hub-card workspace-details">
            <div className="workspace-section__header">
              <h2>Project Details</h2>
              {isLeader && (
                <button type="button" className="hub-btn hub-btn--outline" onClick={() => setEditing((v) => !v)}>
                  {editing ? 'Cancel' : 'Edit Info'}
                </button>
              )}
            </div>

            {editing ? (
              <div className="workspace-form">
                <label>
                  Project Title
                  <input
                    value={project.title}
                    onChange={(e) => setProject({ ...project, title: e.target.value })}
                  />
                </label>
                <label>
                  Team Code
                  <input
                    value={project.teamCode}
                    onChange={(e) => setProject({ ...project, teamCode: e.target.value.toUpperCase() })}
                  />
                </label>
                <label>
                  Section
                  <input
                    value={project.section}
                    onChange={(e) => setProject({ ...project, section: e.target.value.toUpperCase() })}
                  />
                </label>
                <label>
                  Status
                  <select
                    value={project.status}
                    onChange={(e) => setProject({ ...project, status: e.target.value })}
                  >
                    <option>In Progress</option>
                    <option>Under Review</option>
                    <option>Ready for Submission</option>
                  </select>
                </label>
                <button type="button" className="hub-btn hub-btn--primary" onClick={handleSaveInfo}>
                  Save Changes
                </button>
              </div>
            ) : (
              <dl className="workspace-dl">
                <div><dt>Project Title</dt><dd>{project.title}</dd></div>
                <div><dt>Section</dt><dd>{project.section}</dd></div>
                <div><dt>Team Code</dt><dd>{project.teamCode}</dd></div>
                <div><dt>Project Status</dt><dd><span className="workspace-status">{project.status}</span></dd></div>
                <div><dt>Your Role</dt><dd>{isLeader ? 'Leader' : 'Member'}</dd></div>
              </dl>
            )}
            {saved && <p className="workspace-saved">Changes saved.</p>}
          </section>

          <section className="hub-card workspace-adviser">
            <h2>Adviser Assigned</h2>
            <div className="workspace-adviser__card">
              <div className="workspace-adviser__avatar">{project.adviser.name.charAt(4)}</div>
              <div>
                <p className="workspace-adviser__name">{project.adviser.name}</p>
                <p className="workspace-adviser__email">{project.adviser.email}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="hub-card workspace-members">
          <div className="workspace-section__header">
            <h2>Team Members</h2>
            <span className="workspace-members__count">{project.members.length + 1} total</span>
          </div>

          <ul className="workspace-members__list">
            <li className="workspace-member workspace-member--leader">
              <span className="workspace-member__avatar">Y</span>
              <div>
                <p className="workspace-member__name">You (Project Leader)</p>
                <p className="workspace-member__email">you@cit.edu</p>
              </div>
              <span className="workspace-member__badge">Leader</span>
            </li>
            {project.members.map((m) => (
              <li key={m.email} className="workspace-member">
                <span className="workspace-member__avatar">{m.name.charAt(0).toUpperCase()}</span>
                <div>
                  <p className="workspace-member__name">{m.name}</p>
                  <p className="workspace-member__email">{m.email}</p>
                </div>
                {isLeader && (
                  <button type="button" className="workspace-member__remove" onClick={() => removeMember(m.email)}>
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isLeader && (
            <div className="workspace-add-member">
              <input
                type="email"
                placeholder="teammate@cit.edu"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
              />
              <button type="button" className="hub-btn hub-btn--primary" onClick={addMember}>Add Member</button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
