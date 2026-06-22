import { useState } from 'react'
import {
  approvalOptions,
  buildEvaluationReport,
  saveEvaluation,
} from '../utils/adviserEvaluations.js'
import { getReviewStatusMeta } from '../utils/adviserProjects.js'

export default function TeamEvaluationPanel({
  project,
  trace,
  evaluation: initialEvaluation,
  onSaved,
}) {
  const [evaluation, setEvaluation] = useState(initialEvaluation)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const report = buildEvaluationReport(project, trace, evaluation)
  const status = getReviewStatusMeta(report.approvalStatus)

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
    setEditing(false)
    onSaved?.()
    setTimeout(() => setSaved(false), 2500)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="team-eval">
      <div className="team-eval__toolbar">
        <div>
          <h2 className="team-eval__title">Evaluation Report</h2>
          <p className="team-eval__subtitle">
            AI traceability analysis and adviser feedback for Team {project.teamCode}
          </p>
        </div>
        <div className="team-eval__actions">
          {saved ? <span className="team-eval__saved">Saved</span> : null}
          <button
            type="button"
            className="adviser-btn adviser-btn--outline"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? 'View Report' : 'Edit Evaluation'}
          </button>
          <button type="button" className="adviser-btn adviser-btn--outline" onClick={handlePrint}>
            Download PDF
          </button>
          {editing ? (
            <button type="button" className="adviser-btn adviser-btn--primary" onClick={handleSave}>
              Save Evaluation
            </button>
          ) : null}
        </div>
      </div>

      {editing ? (
        <div className="team-eval__edit-grid">
          <section className="card team-eval__edit-card">
            <h3>Project Score &amp; Status</h3>
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
          </section>

          <section className="card team-eval__edit-card">
            <h3>Adviser Comments</h3>
            <div className="adviser-form-group">
              <label htmlFor="overall-comments">Overall Assessment</label>
              <textarea
                id="overall-comments"
                value={evaluation.overallComments}
                onChange={(e) => updateField('overallComments', e.target.value)}
                placeholder="Summarize traceability quality and readiness..."
                rows={4}
              />
            </div>
            <div className="adviser-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="recommendations">Recommendations</label>
              <textarea
                id="recommendations"
                value={evaluation.recommendations}
                onChange={(e) => updateField('recommendations', e.target.value)}
                placeholder="List specific actions before final submission..."
                rows={4}
              />
            </div>
          </section>

          {report.components.length > 0 ? (
            <section className="card team-eval__edit-card team-eval__edit-card--full">
              <h3>Component Remarks</h3>
              <div className="team-eval__component-remarks">
                {report.components.map((component) => (
                  <div key={component.id} className="adviser-form-group">
                    <label htmlFor={`remark-${component.id}`}>{component.name}</label>
                    <textarea
                      id={`remark-${component.id}`}
                      value={evaluation.componentRemarks[component.id] ?? ''}
                      onChange={(e) => updateComponentRemark(component.id, e.target.value)}
                      placeholder={`Feedback for ${component.name}...`}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <article className="team-eval__report card">
          <header className="team-eval__report-head">
            <div>
              <p className="team-eval__report-eyebrow">SyncTrace · Adviser Evaluation Report</p>
              <h3 className="team-eval__report-title">{report.projectTitle}</h3>
              <p className="team-eval__report-meta">
                Team {report.teamCode} · {report.section?.toUpperCase()} · Generated {report.generatedAt}
              </p>
            </div>
            <div className="team-eval__report-score">
              <span className="team-eval__report-score-value">{report.overallScore}</span>
              <span className="team-eval__report-score-label">Overall Score</span>
              <span className={`adviser-status-pill adviser-status-pill--${status.tone}`}>
                {status.label}
              </span>
            </div>
          </header>

          <div className="team-eval__report-metrics">
            <div className="team-eval__report-metric">
              <span className="team-eval__report-metric-value">{report.traceabilityScore}%</span>
              <span className="team-eval__report-metric-label">Traceability</span>
            </div>
            <div className="team-eval__report-metric">
              <span className="team-eval__report-metric-value">{report.gapCount}</span>
              <span className="team-eval__report-metric-label">Gaps</span>
            </div>
            <div className="team-eval__report-metric">
              <span className="team-eval__report-metric-value">
                {report.artifactsUploaded}/{report.artifactsTotal}
              </span>
              <span className="team-eval__report-metric-label">Artifacts</span>
            </div>
            <div className="team-eval__report-metric">
              <span className="team-eval__report-metric-value" style={{ textTransform: 'capitalize' }}>
                {report.continuityStatus}
              </span>
              <span className="team-eval__report-metric-label">Continuity</span>
            </div>
          </div>

          <section className="team-eval__report-section">
            <h4>AI Traceability Summary</h4>
            <p>{report.aiSummary}</p>
          </section>

          {report.topGaps.length > 0 ? (
            <section className="team-eval__report-section">
              <h4>Critical Gaps Identified</h4>
              <ul className="team-eval__gap-list">
                {report.topGaps.map((gap) => (
                  <li key={gap.id} className={`team-eval__gap team-eval__gap--${gap.severity}`}>
                    <strong>{gap.title}</strong>
                    <span>{gap.component} · {gap.from} → {gap.to}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="team-eval__report-section">
            <h4>Adviser Recommendations</h4>
            <p className="team-eval__report-pre">{report.recommendations}</p>
          </section>

          {Object.keys(report.componentRemarks).length > 0 ? (
            <section className="team-eval__report-section">
              <h4>Component-Level Feedback</h4>
              <ul className="team-eval__remark-list">
                {Object.entries(report.componentRemarks).map(([id, remark]) => {
                  if (!remark) return null
                  const component = report.components.find((c) => c.id === id)
                  return (
                    <li key={id}>
                      <strong>{component?.name ?? id}</strong>
                      <p>{remark}</p>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          <footer className="team-eval__report-footer">
            <p>This report combines AI engine extraction results with adviser evaluation for capstone traceability review.</p>
          </footer>
        </article>
      )}
    </div>
  )
}
