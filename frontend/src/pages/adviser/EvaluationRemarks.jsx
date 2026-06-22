import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdviserLayout from '../../components/AdviserLayout.jsx'
import {
  approvalOptions,
  loadEvaluation,
  saveEvaluation,
} from '../../utils/adviserEvaluations.js'
import {
  getAssignedProject,
  getProjectTraceData,
  getReviewStatusMeta,
  setSelectedProjectId,
} from '../../utils/adviserProjects.js'
import '../HubPage.css'
import './AdviserPages.css'

export default function EvaluationRemarks() {
  const { projectId } = useParams()
  const project = getAssignedProject(projectId)
  const [evaluation, setEvaluation] = useState(() => loadEvaluation(projectId))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) setSelectedProjectId(project.id)
  }, [project])

  useEffect(() => {
    if (projectId) setEvaluation(loadEvaluation(projectId))
  }, [projectId])

  if (!project) {
    return <Navigate to="/adviser/dashboard" replace />
  }

  const trace = getProjectTraceData(project)
  const components = trace.components ?? []
  const status = getReviewStatusMeta(evaluation.approvalStatus || project.reviewStatus)

  function updateField(field, value) {
    setEvaluation((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function updateComponentRemark(componentId, remark) {
    setEvaluation((prev) => ({
      ...prev,
      componentRemarks: { ...prev.componentRemarks, [componentId]: remark },
    }))
    setSaved(false)
  }

  function handleSave() {
    saveEvaluation(project.id, evaluation)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdviserLayout>
      <div className="hub-page adviser-page">
        <header className="hub-banner">
          <div className="hub-banner__left">
            <div className="hub-banner__icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div>
              <h1 className="hub-banner__title">Evaluation & Remarks</h1>
              <p className="hub-banner__subtitle">Team {project.teamCode} · adviser feedback and approval</p>
            </div>
          </div>
        </header>

        <div className="adviser-two-col">
          <section className="card" style={{ padding: '20px 24px' }}>
            <h2 className="adviser-section-title">Project Score</h2>
            <div className="adviser-form-group">
              <label htmlFor="project-score">Score (0–100)</label>
              <input
                id="project-score"
                type="number"
                min="0"
                max="100"
                value={evaluation.projectScore ?? ''}
                onChange={(e) => updateField('projectScore', e.target.value ? Number(e.target.value) : null)}
                placeholder={`Suggested: ${project.traceabilityScore}`}
              />
            </div>
            <div className="adviser-form-group">
              <label htmlFor="approval-status">Approval Status</label>
              <select
                id="approval-status"
                value={evaluation.approvalStatus}
                onChange={(e) => updateField('approvalStatus', e.target.value)}
              >
                {approvalOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
              Current status: <span className={`adviser-status-pill adviser-status-pill--${status.tone}`}>{status.label}</span>
            </p>
          </section>

          <section className="card" style={{ padding: '20px 24px' }}>
            <h2 className="adviser-section-title">Overall Comments</h2>
            <div className="adviser-form-group">
              <label htmlFor="overall-comments">Comments</label>
              <textarea
                id="overall-comments"
                value={evaluation.overallComments}
                onChange={(e) => updateField('overallComments', e.target.value)}
                placeholder="Summarize traceability quality, artifact completeness, and readiness for defense..."
              />
            </div>
            <div className="adviser-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="recommendations">Recommendations</label>
              <textarea
                id="recommendations"
                value={evaluation.recommendations}
                onChange={(e) => updateField('recommendations', e.target.value)}
                placeholder="List specific actions the team should take before final submission..."
              />
            </div>
          </section>
        </div>

        {components.length > 0 ? (
          <section className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
            <h2 className="adviser-section-title">Comments per Component</h2>
            {components.map((component) => (
              <div key={component.id} className="adviser-form-group">
                <label htmlFor={`remark-${component.id}`}>{component.name}</label>
                <textarea
                  id={`remark-${component.id}`}
                  value={evaluation.componentRemarks[component.id] ?? ''}
                  onChange={(e) => updateComponentRemark(component.id, e.target.value)}
                  placeholder={`Feedback for ${component.name} (${component.smartGoal})...`}
                  rows={2}
                  style={{ minHeight: 64 }}
                />
              </div>
            ))}
          </section>
        ) : (
          <section className="card" style={{ padding: '20px 24px', marginBottom: 16 }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
              Component-level remarks available when reviewing Team 16 (full traceability data).
            </p>
          </section>
        )}

        <div className="adviser-actions">
          <button type="button" className="adviser-btn adviser-btn--primary" onClick={handleSave}>
            {saved ? 'Saved' : 'Save Evaluation'}
          </button>
          <Link to={`/adviser/review/${project.id}`} className="adviser-btn adviser-btn--outline">
            Back to Project Review
          </Link>
        </div>
      </div>
    </AdviserLayout>
  )
}
