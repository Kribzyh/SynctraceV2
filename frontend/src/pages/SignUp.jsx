import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getPostAuthRoute, setUserRole } from '../utils/session.js'
import './Login.css'
import './SignUp.css'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function TraceabilityFlow() {
  return (
    <div className="flow-card">
      <p className="flow-card__label">TRACEABILITY FLOW</p>
      <div className="flow-diagram">
        <div className="flow-node flow-node--proposal">PROPOSAL</div>
        <div className="flow-arrow" aria-hidden="true" />
        <div className="flow-node">SRS</div>
        <div className="flow-arrow" aria-hidden="true" />
        <div className="flow-row">
          <div className="flow-node flow-node--small">SDD</div>
          <span className="flow-connector" aria-hidden="true">→</span>
          <div className="flow-node flow-node--small">SPMP</div>
          <span className="flow-connector" aria-hidden="true">→</span>
          <div className="flow-node flow-node--small">STD</div>
        </div>
        <div className="flow-arrow" aria-hidden="true" />
        <div className="flow-node flow-node--source">SOURCE CODE</div>
      </div>
    </div>
  )
}

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Upload artifacts, run audits, and track capstone traceability.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </svg>
    ),
  },
  {
    id: 'adviser',
    title: 'Adviser',
    description: 'Review student projects, validate mappings, and approve submissions.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

export default function SignUp() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)

  function handleContinue() {
    if (!selectedRole) return
    setUserRole(selectedRole, { isNewUser: true })
    navigate(getPostAuthRoute())
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="login-hero__content">
          <h1 className="login-hero__title">
            Intelligent
            <br />
            <span className="login-hero__accent">Traceability</span>
            <br />
            Auditing
          </h1>
          <p className="login-hero__subtitle">
            Automate artifact synchronization, continuity validation, and 
            traceability audit reporting across software engineering capstone documents.
          </p>
          <TraceabilityFlow />
        </div>
      </section>

      <section className="login-panel signup-panel">
        <div className="login-panel__content signup-panel__content">
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
              <p className="login-brand__tag">ACADEMIC AUDIT</p>
            </header>
          </div>

          <div className="signup-form">
            <p className="signup-form__title">Create your account</p>
            <p className="signup-form__subtitle">Choose your role to get started</p>

            <div className="role-cards">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-card${selectedRole === role.id ? ' role-card--selected' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="role-card__icon">{role.icon}</div>
                  <p className="role-card__title">{role.title}</p>
                  <p className="role-card__desc">{role.description}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="login-google-btn"
              disabled={!selectedRole}
              onClick={handleContinue}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="login-signup">
              Already have an account?{' '}
              <Link to="/login" className="login-signup__link">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <footer className="login-footer">
          SYNCTRACE — AI POWERED ACADEMIC TRACEABILITY
        </footer>
      </section>
    </div>
  )
}
