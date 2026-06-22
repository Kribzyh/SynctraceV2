import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { capstoneAdvisers } from '../utils/advisers.js'
import { getUserRole, isWorkspaceInitialized, saveProject } from '../utils/session.js'
import './Login.css'
import './InitializeProject.css'

const steps = [
  { id: 1, label: 'Project Title', desc: 'Enter Project Title' },
  { id: 2, label: 'Section', desc: 'Enter Section' },
  { id: 3, label: 'Team Code', desc: 'Enter Team Code' },
  { id: 4, label: 'Adviser', desc: 'Select Adviser' },
  { id: 5, label: 'Team Members', desc: 'Add Team Members' },
]

export default function InitializeProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [section, setSection] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [adviserId, setAdviserId] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [members, setMembers] = useState([])

  if (getUserRole() !== 'student' || isWorkspaceInitialized()) {
    return <Navigate to="/dashboard" replace />
  }

  const selectedAdviser = capstoneAdvisers.find((adviser) => adviser.id === adviserId) ?? null

  function addMember() {
    const email = memberEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) return
    if (members.some((m) => m.email === email)) return
    setMembers((prev) => [...prev, { email, name: email.split('@')[0] }])
    setMemberEmail('')
  }

  function removeMember(email) {
    setMembers((prev) => prev.filter((m) => m.email !== email))
  }

  function handleNext() {
    if (step === 1 && !title.trim()) return
    if (step === 2 && !section.trim()) return
    if (step === 3 && !teamCode.trim()) return
    if (step === 4 && !adviserId) return
    if (step < 5) {
      setStep(step + 1)
      return
    }

    saveProject({
      title: title.trim(),
      section: section.trim().toUpperCase(),
      teamCode: teamCode.trim(),
      members,
      teamRole: 'leader',
      status: 'In Progress',
      adviser: {
        id: selectedAdviser.id,
        name: selectedAdviser.name,
        email: selectedAdviser.email,
      },
    })
    navigate('/dashboard')
  }

  function handleBack() {
    if (step > 1) setStep(step - 1)
  }

  const canContinue =
    (step === 1 && title.trim()) ||
    (step === 2 && section.trim()) ||
    (step === 3 && teamCode.trim()) ||
    (step === 4 && adviserId) ||
    step === 5

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="login-hero__content">
          <h1 className="login-hero__title">
            Initialize
            <br />
            <span className="login-hero__accent">Project</span>
            <br />
            Workspace
          </h1>
          <p className="login-hero__subtitle">
            Set up your capstone project workspace before starting traceability audits.
          </p>

          <div className="init-flow-card">
            <p className="init-flow-card__label">SETUP FLOW</p>
            <ul className="init-flow-list">
              {steps.map((s) => (
                <li
                  key={s.id}
                  className={`init-flow-list__item${step === s.id ? ' init-flow-list__item--active' : ''}${step > s.id ? ' init-flow-list__item--done' : ''}`}
                >
                  <span className="init-flow-list__num">{s.id}</span>
                  {s.desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="login-panel init-panel">
        <div className="login-panel__content init-panel__content">
          <div className="login-panel__header">
            <div className="login-panel__crest">
              <img
                src="/images/citu-logo.png"
                alt="Cebu Institute of Technology - University"
                className="login-panel__crest-img"
              />
            </div>
            <header className="login-brand">
              <p className="login-brand__name">SyncTrace</p>
              <p className="login-brand__tag">NEW STUDENT SETUP</p>
            </header>
          </div>

          <div className="init-form">
            <div className="init-steps">
              {steps.map((s) => (
                <div
                  key={s.id}
                  className={`init-step-dot${step >= s.id ? ' init-step-dot--active' : ''}`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="init-step">
                <h2 className="init-step__title">Enter Project Title</h2>
                <p className="init-step__subtitle">
                  Give your capstone project a name for this workspace.
                </p>
                <input
                  type="text"
                  className="init-input"
                  placeholder="e.g. SyncTrace"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div className="init-step">
                <h2 className="init-step__title">Enter Section</h2>
                <p className="init-step__subtitle">
                  Enter your class section code as assigned by your department.
                </p>
                <input
                  type="text"
                  className="init-input"
                  placeholder="e.g. IT411-02"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
            )}

            {step === 3 && (
              <div className="init-step">
                <h2 className="init-step__title">Enter Team Code</h2>
                <p className="init-step__subtitle">
                  Use the team code provided by your adviser to join your group.
                </p>
                <input
                  type="text"
                  className="init-input"
                  placeholder="e.g. CITU-2026-A1"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
            )}

            {step === 4 && (
              <div className="init-step">
                <h2 className="init-step__title">Select Adviser</h2>
                <p className="init-step__subtitle">
                  Choose the capstone adviser assigned to your section.
                </p>
                <select
                  className="init-input init-select"
                  value={adviserId}
                  onChange={(e) => setAdviserId(e.target.value)}
                  autoFocus
                >
                  <option value="">Select an adviser...</option>
                  {capstoneAdvisers.map((adviser) => (
                    <option key={adviser.id} value={adviser.id}>
                      {adviser.name} — {adviser.section}
                    </option>
                  ))}
                </select>
                {selectedAdviser ? (
                  <p className="init-adviser-preview">{selectedAdviser.email}</p>
                ) : null}
              </div>
            )}

            {step === 5 && (
              <div className="init-step">
                <h2 className="init-step__title">Add Team Members</h2>
                <p className="init-step__subtitle">
                  Invite teammates by email. You can skip and add members later.
                </p>
                <div className="init-member-add">
                  <input
                    type="email"
                    className="init-input"
                    placeholder="teammate@cit.edu"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  />
                  <button type="button" className="init-member-add__btn" onClick={addMember}>
                    Add
                  </button>
                </div>
                {members.length > 0 ? (
                  <ul className="init-members">
                    {members.map((m) => (
                      <li key={m.email} className="init-members__item">
                        <span>{m.email}</span>
                        <button
                          type="button"
                          className="init-members__remove"
                          onClick={() => removeMember(m.email)}
                          aria-label={`Remove ${m.email}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="init-members__empty">No team members added yet.</p>
                )}
              </div>
            )}

            <div className="init-actions">
              {step > 1 && (
                <button type="button" className="init-btn init-btn--back" onClick={handleBack}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="init-btn init-btn--next"
                disabled={!canContinue}
                onClick={handleNext}
              >
                {step === 5 ? 'Create Workspace' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        <footer className="login-footer">
          SYNCTRACE — AI POWERED ACADEMIC TRACEABILITY
        </footer>
      </section>
    </div>
  )
}
