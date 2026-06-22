import { useMemo, useState } from 'react'
import {
  artifactDefinitions,
  evaluationSystems,
  getActiveVersion,
  getArtifactEvaluator,
  getArtifactIntakeSource,
  isSyncTraceEvaluated,
  loadArtifacts,
} from '../utils/artifacts.js'
import '../pages/AiConfig.css'

const STORAGE_KEY = 'synctrace-ai-config'

const defaultDocuments = artifactDefinitions.map((def) => ({
  id: def.id,
  name: def.title,
  abbr: def.abbr,
  enabled: true,
  mode: def.id === 'srs' || def.id === 'std' ? 'strict' : def.id === 'repo' ? 'relaxed' : 'standard',
  instructions: {
    proposal: 'Verify SMART goals and project scope alignment.',
    srs: 'Check functional and non-functional requirements traceability.',
    sdd: 'Validate design components map to SRS requirements.',
    spmp: 'Ensure deliverables and milestones match design phases.',
    std: 'Confirm test cases cover all SRS requirements.',
    repo: 'Audit code structure against SDD components.',
  }[def.id],
}))

const defaultConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: '',
  confidenceThreshold: 85,
  temperature: 0.3,
  autoGapAnalysis: true,
  auditPrompt:
    'Analyze capstone project artifacts for traceability gaps, continuity breaks, and IEEE documentation compliance. Focus on SMART goals flowing through SRS, SDD, SPMP, STD, and implementation.',
  documents: defaultDocuments,
}

const evaluationModes = [
  { id: 'strict', label: 'Strict' },
  { id: 'standard', label: 'Standard' },
  { id: 'relaxed', label: 'Relaxed' },
]

const providers = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Google Gemini' },
  { id: 'anthropic', label: 'Anthropic Claude' },
]

const modelsByProvider = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultConfig
    const parsed = JSON.parse(saved)
    const documents = defaultDocuments.map((doc) => {
      const savedDoc = parsed.documents?.find((d) => d.id === doc.id)
      if (!savedDoc) return doc
      const { source, pipeline, ...rest } = savedDoc
      return { ...doc, ...rest }
    })
    return { ...defaultConfig, ...parsed, documents }
  } catch {
    return defaultConfig
  }
}

export default function AiEngineConfigPanel() {
  const [config, setConfig] = useState(loadConfig)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const intakeByDocId = useMemo(() => {
    const artifacts = loadArtifacts()
    return Object.fromEntries(
      artifacts.map((artifact) => {
        const source = getArtifactIntakeSource(artifact)
        const active = getActiveVersion(artifact)
        return [artifact.id, { source, active }]
      }),
    )
  }, [])

  function update(field, value) {
    setConfig((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'provider') {
        next.model = modelsByProvider[value]?.[0] ?? prev.model
      }
      return next
    })
    setSaved(false)
  }

  function updateDocument(id, field, value) {
    setConfig((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, [field]: value } : doc,
      ),
    }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="ai-engine-config">
      <div className="ai-engine-config__head">
        <p className="ai-engine-config__intro">
          SyncTrace coordinates multiple evaluation systems: MetaDoc for proposals, IEEE Docs Evaluator for SRS–STD,
          and SyncTrace for source code traceability. Configure intake and SyncTrace analysis settings below.
        </p>
        <button type="button" className="ai-engine-config__save" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      <div className="ai-config-grid">
        <section className="card ai-config-card">
          <h2 className="ai-config-card__title">Provider &amp; Model</h2>
          <p className="ai-config-card__desc">Select the AI service and model for audit analysis.</p>

          <div className="ai-config-field">
            <label htmlFor="provider">AI Provider</label>
            <select
              id="provider"
              value={config.provider}
              onChange={(e) => update('provider', e.target.value)}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="ai-config-field">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={config.model}
              onChange={(e) => update('model', e.target.value)}
            >
              {(modelsByProvider[config.provider] ?? []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="ai-config-field">
            <label htmlFor="apiKey">API Key</label>
            <div className="ai-config-field__row">
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={config.apiKey}
                placeholder="sk-..."
                onChange={(e) => update('apiKey', e.target.value)}
              />
              <button
                type="button"
                className="ai-config-field__toggle"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="ai-config-field__hint">Stored locally in your browser for this session.</p>
          </div>
        </section>

        <section className="card ai-config-card">
          <h2 className="ai-config-card__title">Analysis Settings</h2>
          <p className="ai-config-card__desc">Tune how strictly the AI evaluates your artifacts.</p>

          <div className="ai-config-field">
            <label htmlFor="confidence">
              Minimum Confidence Threshold
              <span className="ai-config-field__value">{config.confidenceThreshold}%</span>
            </label>
            <input
              id="confidence"
              type="range"
              min="50"
              max="99"
              value={config.confidenceThreshold}
              onChange={(e) => update('confidenceThreshold', Number(e.target.value))}
            />
            <p className="ai-config-field__hint">
              Issues below this confidence level will be flagged for manual review.
            </p>
          </div>

          <div className="ai-config-field">
            <label htmlFor="temperature">
              Temperature
              <span className="ai-config-field__value">{config.temperature}</span>
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => update('temperature', Number(e.target.value))}
            />
            <p className="ai-config-field__hint">
              Lower values produce more consistent, deterministic audit results.
            </p>
          </div>

          <div className="ai-config-toggle">
            <div>
              <p className="ai-config-toggle__label">Auto Gap Analysis</p>
              <p className="ai-config-toggle__desc">Run AI analysis automatically when artifacts are synced.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.autoGapAnalysis}
              className={`ai-config-switch${config.autoGapAnalysis ? ' ai-config-switch--on' : ''}`}
              onClick={() => update('autoGapAnalysis', !config.autoGapAnalysis)}
            >
              <span className="ai-config-switch__thumb" />
            </button>
          </div>
        </section>

        <section className="card ai-config-card ai-config-card--full">
          <h2 className="ai-config-card__title">Evaluation Pipeline</h2>
          <p className="ai-config-card__desc">
            Each artifact type is evaluated by its assigned external or internal system. SyncTrace ingests results
            and maps them into the traceability matrix.
          </p>
          <div className="ai-eval-pipeline">
            {evaluationSystems.map((system) => (
              <div key={system.id} className={`ai-eval-pipeline__item ai-eval-pipeline__item--${system.tone}`}>
                <span className="ai-eval-pipeline__label">{system.label}</span>
                <span className="ai-eval-pipeline__docs">
                  {system.id === 'metadoc' && 'Proposal'}
                  {system.id === 'ieee-docs-evaluator' && 'SRS · SDD · SPMP · STD'}
                  {system.id === 'synctrace' && 'Source Code'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="card ai-config-card ai-config-card--full">
          <h2 className="ai-config-card__title">Document Configuration</h2>
          <p className="ai-config-card__desc">
            Intake source comes from Artifact Upload. Evaluation system is fixed per document type; only source code
            uses SyncTrace AI settings on this page.
          </p>

          <div className="ai-doc-table-wrap">
            <table className="ai-doc-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Intake Source</th>
                  <th>Evaluation System</th>
                  <th>SyncTrace Analysis</th>
                  <th>Evaluation Mode</th>
                  <th>AI Instructions</th>
                </tr>
              </thead>
              <tbody>
                {config.documents.map((doc) => {
                  const evaluator = getArtifactEvaluator(doc.id)
                  const syncTraceManaged = isSyncTraceEvaluated(doc.id)

                  return (
                  <tr key={doc.id}>
                    <td>
                      <strong>{doc.name}</strong>
                      <span className="ai-doc-table__abbr">{doc.abbr}</span>
                    </td>
                    <td>
                      {(() => {
                        const { source, active } = intakeByDocId[doc.id] ?? {}
                        if (!source) {
                          return (
                            <span className="ai-doc-table__source ai-doc-table__source--empty">
                              Not uploaded
                            </span>
                          )
                        }
                        return (
                          <span
                            className="ai-doc-table__source"
                            title={active?.fileName ?? active?.value ?? source.label}
                          >
                            {source.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td>
                      {evaluator ? (
                        <span
                          className={`ai-doc-table__evaluator ai-doc-table__evaluator--${evaluator.tone}`}
                          title={evaluator.description}
                        >
                          {evaluator.label}
                        </span>
                      ) : (
                        <span className="ai-doc-table__source ai-doc-table__source--empty">—</span>
                      )}
                    </td>
                    <td>
                      {syncTraceManaged ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={doc.enabled}
                          aria-label={`Toggle SyncTrace analysis for ${doc.name}`}
                          className={`ai-config-switch ai-config-switch--sm${doc.enabled ? ' ai-config-switch--on' : ''}`}
                          onClick={() => updateDocument(doc.id, 'enabled', !doc.enabled)}
                        >
                          <span className="ai-config-switch__thumb" />
                        </button>
                      ) : (
                        <span className="ai-doc-table__external">External</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="ai-doc-table__select"
                        value={doc.mode}
                        disabled={!syncTraceManaged || !doc.enabled}
                        onChange={(e) => updateDocument(doc.id, 'mode', e.target.value)}
                      >
                        {evaluationModes.map((mode) => (
                          <option key={mode.id} value={mode.id}>{mode.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-doc-table__input"
                        value={doc.instructions}
                        disabled={!syncTraceManaged || !doc.enabled}
                        placeholder={syncTraceManaged ? 'Custom AI evaluation rules...' : 'Handled by external evaluator'}
                        onChange={(e) => updateDocument(doc.id, 'instructions', e.target.value)}
                      />
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card ai-config-card ai-config-card--full">
          <h2 className="ai-config-card__title">Audit Instructions</h2>
          <p className="ai-config-card__desc">
            Custom system prompt guiding how the AI performs traceability and continuity checks.
          </p>

          <div className="ai-config-field">
            <label htmlFor="auditPrompt" className="sr-only">Audit prompt</label>
            <textarea
              id="auditPrompt"
              rows={5}
              value={config.auditPrompt}
              onChange={(e) => update('auditPrompt', e.target.value)}
              placeholder="Describe how the AI should audit your project artifacts..."
            />
          </div>
        </section>
      </div>
    </div>
  )
}
