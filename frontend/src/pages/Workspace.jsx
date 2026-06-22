import { useState } from 'react'
import { CheckCircle2, Settings } from 'lucide-react'
import { PageBanner } from '../components/PageBanner.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getProject, saveProject } from '../utils/session.js'
import './HubPage.css'
import './Workspace.css'

export default function Workspace() {
  const initial = getProject() ?? {}
  const [project, setProject] = useState({
    title: initial.title ?? 'SyncTrace',
    section: initial.section ?? 'IT411-02',
    teamCode: initial.teamCode ?? 'CITU-2026-A1',
    status: initial.status ?? 'In Progress',
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
    setTimeout(() => setSaved(false), 2500)
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
        
        <PageBanner
          icon={<Settings className="text-[#EAB308]" size={28} />}
          title="Project Details"
          subtitle="Manage your capstone project details and team members."
        />

        {saved && (
          <div className="workspace-global-alert">
            <CheckCircle2 size={18} />
            <span>Workspace changes saved successfully.</span>
          </div>
        )}

        <div className="workspace-grid">
          {/* Left Column: Project Details */}
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
          </section>

          {/* Right Column: Team Members */}
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
                  <p className="workspace-member__email">you@gmail.com</p>
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
                  placeholder="teammate@gmail.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <button type="button" className="hub-btn hub-btn--primary" onClick={addMember}>Add Member</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}