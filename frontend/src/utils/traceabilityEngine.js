/**
 * SyncTrace Traceability Mapping Engine
 *
 * Generates component-level traceability relationships across IEEE artifacts:
 * Proposal → SRS → SDD → SPMP → STD → Source Code
 */

export const RELATIONSHIP_TYPES = {
  DERIVED_FROM: 'derived_from',
  IMPLEMENTED_AS: 'implemented_as',
  TESTED_BY: 'tested_by',
  MANAGED_BY: 'managed_by',
}

export const ARTIFACT_FLOW = [
  { key: 'proposal', label: 'Proposal', extractTypes: ['objective', 'scope', 'feature'] },
  { key: 'srs', label: 'SRS', extractTypes: ['functional_requirement', 'non_functional_requirement'] },
  { key: 'sdd', label: 'SDD', extractTypes: ['module', 'diagram', 'wireframe', 'architecture'] },
  { key: 'spmp', label: 'SPMP', extractTypes: ['task', 'milestone', 'deliverable'] },
  { key: 'std', label: 'STD', extractTypes: ['test_case', 'test_scenario'] },
  { key: 'code', label: 'Source Code', extractTypes: ['controller', 'service', 'component'] },
]

export const TRACE_HOPS = [
  {
    from: 'proposal',
    to: 'srs',
    relationship: RELATIONSHIP_TYPES.DERIVED_FROM,
    lifecycleFrom: 'proposal',
    lifecycleTo: 'srs',
    gapType: 'requirement-trace',
  },
  {
    from: 'srs',
    to: 'sdd',
    relationship: RELATIONSHIP_TYPES.IMPLEMENTED_AS,
    lifecycleFrom: 'srs',
    lifecycleTo: 'modules',
    gapType: 'sdd-mapping',
  },
  {
    from: 'sdd',
    to: 'spmp',
    relationship: RELATIONSHIP_TYPES.MANAGED_BY,
    lifecycleFrom: 'modules',
    lifecycleTo: null,
    gapType: 'planning-trace',
  },
  {
    from: 'spmp',
    to: 'std',
    relationship: RELATIONSHIP_TYPES.TESTED_BY,
    lifecycleFrom: null,
    lifecycleTo: 'testCases',
    gapType: 'test-case',
  },
  {
    from: 'std',
    to: 'code',
    relationship: RELATIONSHIP_TYPES.IMPLEMENTED_AS,
    lifecycleFrom: 'testCases',
    lifecycleTo: 'sourceCode',
    gapType: 'implementation',
  },
]

const ARTIFACT_LABELS = Object.fromEntries(ARTIFACT_FLOW.map((a) => [a.key, a.label]))

const LIFECYCLE_EXTRACTORS = {
  proposal: (component) => [{
    entityType: 'objective',
    label: component.lifecycle.proposal?.ref ?? '',
    lifecycleKey: 'proposal',
  }],
  srs: (component) => [{
    entityType: 'functional_requirement',
    label: component.lifecycle.srs?.ref ?? '',
    lifecycleKey: 'srs',
  }],
  sdd: (component) => [
    { entityType: 'module', label: component.lifecycle.modules?.ref ?? '', lifecycleKey: 'modules' },
    { entityType: 'diagram', label: component.lifecycle.diagrams?.ref ?? '', lifecycleKey: 'diagrams' },
    { entityType: 'wireframe', label: component.lifecycle.wireframes?.ref ?? '', lifecycleKey: 'wireframes' },
  ],
  spmp: (component) => [{
    entityType: 'deliverable',
    label: `${component.name} delivery milestone`,
    lifecycleKey: null,
  }],
  std: (component) => [{
    entityType: 'test_case',
    label: component.lifecycle.testCases?.ref ?? '',
    lifecycleKey: 'testCases',
  }],
  code: (component) => [{
    entityType: 'component',
    label: component.lifecycle.sourceCode?.ref ?? '',
    lifecycleKey: 'sourceCode',
  }],
}

function normalizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getLifecycleStatus(component, key) {
  if (!key) return component.mapping ? 'linked' : 'missing'
  const item = component.lifecycle[key]
  return item?.status ?? 'missing'
}

/** Step 1 & 2: Extract and normalize entities from each artifact per component. */
export function extractNormalizedEntities(component) {
  const entities = []

  ARTIFACT_FLOW.forEach(({ key: artifact }) => {
    const extractor = LIFECYCLE_EXTRACTORS[artifact]
    if (!extractor) return

    const mapped = component.mapping[artifact]
    extractor(component).forEach((raw, index) => {
      const lifecycleStatus = raw.lifecycleKey
        ? getLifecycleStatus(component, raw.lifecycleKey)
        : (mapped ? 'linked' : 'missing')

      entities.push({
        id: `${component.id}:${artifact}:${raw.entityType}:${index}`,
        componentId: component.id,
        componentName: component.name,
        artifact,
        artifactLabel: ARTIFACT_LABELS[artifact],
        entityType: raw.entityType,
        label: raw.label,
        normalizedLabel: normalizeLabel(raw.label),
        lifecycleKey: raw.lifecycleKey,
        mapped,
        status: mapped && lifecycleStatus === 'linked' ? 'linked' : 'missing',
      })
    })
  })

  return entities
}

/** Step 6: Compute confidence score for a traceability link (0–1). */
export function computeLinkConfidence(component, hop) {
  const fromMapped = Boolean(component.mapping[hop.from])
  const toMapped = Boolean(component.mapping[hop.to])

  if (!fromMapped || !toMapped) return 0

  let score = 0.55

  if (hop.lifecycleFrom) {
    const status = getLifecycleStatus(component, hop.lifecycleFrom)
    if (status === 'linked') score += 0.15
    else score -= 0.25
  } else {
    score += 0.05
  }

  if (hop.lifecycleTo) {
    const status = getLifecycleStatus(component, hop.lifecycleTo)
    if (status === 'linked') score += 0.15
    else score -= 0.25
  } else {
    score += 0.05
  }

  if (fromMapped && toMapped) score += 0.1

  return Math.round(Math.max(0, Math.min(1, score)) * 100) / 100
}

function getRef(component, lifecycleKey) {
  if (!lifecycleKey) return '—'
  return component.lifecycle[lifecycleKey]?.ref ?? 'Not found'
}

function gapSeverity(confidence, hop) {
  if (hop.gapType === 'implementation' || hop.gapType === 'sdd-mapping') return 'high'
  if (hop.gapType === 'test-case' || hop.gapType === 'planning-trace') return 'medium'
  return 'low'
}

function buildGapDescription(component, hop) {
  const fromLabel = ARTIFACT_LABELS[hop.from]
  const toLabel = ARTIFACT_LABELS[hop.to]
  const fromRef = hop.lifecycleFrom ? getRef(component, hop.lifecycleFrom) : component.name
  const toRef = hop.lifecycleTo ? getRef(component, hop.lifecycleTo) : 'Not found'

  return `${fromRef} in ${fromLabel} is not fully traced to ${toLabel} (${toRef}).`
}

function buildGapFix(hop) {
  const fixes = {
    'requirement-trace': 'Add the proposal objective reference to your SRS requirements section.',
    'sdd-mapping': 'Add a corresponding SDD module, diagram, or interface for this SRS requirement.',
    'planning-trace': 'Include SPMP tasks and milestones that cover this SDD deliverable.',
    'test-case': 'Add STD test cases that validate the SRS requirement for this component.',
    implementation: 'Implement the source code module or update the SDD to match current scope.',
  }
  return fixes[hop.gapType] ?? 'Complete the missing artifact mapping for this component.'
}

/** Steps 3–5: Match components and generate traceability links across the artifact flow. */
export function generateTraceabilityLinks(componentList) {
  const links = []
  let linkId = 1

  componentList.forEach((component) => {
    TRACE_HOPS.forEach((hop) => {
      const confidence = computeLinkConfidence(component, hop)
      const fromMapped = Boolean(component.mapping[hop.from])
      const toMapped = Boolean(component.mapping[hop.to])
      const status = confidence >= 0.5 ? 'linked' : 'missing'

      links.push({
        id: `link-${linkId++}`,
        componentId: component.id,
        componentName: component.name,
        fromArtifact: hop.from,
        toArtifact: hop.to,
        fromLabel: ARTIFACT_LABELS[hop.from],
        toLabel: ARTIFACT_LABELS[hop.to],
        relationshipType: hop.relationship,
        fromRef: hop.lifecycleFrom ? getRef(component, hop.lifecycleFrom) : component.smartGoal,
        toRef: hop.lifecycleTo ? getRef(component, hop.lifecycleTo) : '—',
        confidence,
        confidencePercent: Math.round(confidence * 100),
        status,
        mapped: fromMapped && toMapped,
      })
    })
  })

  return links
}

/** Step 7: Detect missing or broken traceability links. */
export function detectMissingLinks(componentList, links) {
  const gaps = []
  let gapId = 1

  links.forEach((link) => {
    if (link.status === 'linked' && link.confidence >= 0.5) return

    const hop = TRACE_HOPS.find(
      (h) => h.from === link.fromArtifact && h.to === link.toArtifact,
    )
    const component = componentList.find((c) => c.id === link.componentId)
    if (!component || !hop) return

    gaps.push({
      id: gapId++,
      type: hop.gapType,
      fromKey: hop.from,
      toKey: hop.to,
      title: `Missing ${ARTIFACT_LABELS[hop.from]} → ${ARTIFACT_LABELS[hop.to]} link`,
      from: ARTIFACT_LABELS[hop.from],
      to: ARTIFACT_LABELS[hop.to],
      component: component.name,
      componentId: component.id,
      relationshipType: hop.relationship,
      confidence: link.confidencePercent,
      severity: gapSeverity(link.confidence, hop),
      description: buildGapDescription(component, hop),
      fix: buildGapFix(hop),
    })
  })

  return gaps
}

/** Build traceability map table structure (component × artifact). */
export function buildTraceabilityMap(componentList) {
  return componentList.map((component) => ({
    componentId: component.id,
    componentName: component.name,
    smartGoal: component.smartGoal,
    cells: ARTIFACT_FLOW.map(({ key, label }) => ({
      artifact: key,
      label,
      mapped: Boolean(component.mapping[key]),
      ref: getArtifactRef(component, key),
    })),
    coverage: ARTIFACT_FLOW.filter(({ key }) => component.mapping[key]).length,
    totalArtifacts: ARTIFACT_FLOW.length,
  }))
}

function getArtifactRef(component, artifactKey) {
  const hopTo = TRACE_HOPS.find((h) => h.to === artifactKey && h.lifecycleTo)
  if (hopTo?.lifecycleTo) return getRef(component, hopTo.lifecycleTo)

  const hopFrom = TRACE_HOPS.find((h) => h.from === artifactKey && h.lifecycleFrom)
  if (hopFrom?.lifecycleFrom) return getRef(component, hopFrom.lifecycleFrom)

  const fallback = {
    proposal: 'proposal',
    srs: 'srs',
    sdd: 'modules',
    std: 'testCases',
    code: 'sourceCode',
  }
  const key = fallback[artifactKey]
  return key ? getRef(component, key) : '—'
}

/**
 * Run the full SyncTrace Traceability Mapping Engine pipeline.
 * @returns {Object} Traceability output: components, entities, links, gaps, map, stats
 */
export function runTraceabilityMapping(componentList) {
  const normalizedComponents = componentList.map((component) => ({
    id: component.id,
    name: component.name,
    smartGoal: component.smartGoal,
    mapping: { ...component.mapping },
  }))

  const entities = componentList.flatMap(extractNormalizedEntities)
  const links = generateTraceabilityLinks(componentList)
  const gaps = detectMissingLinks(componentList, links)
  const traceabilityMap = buildTraceabilityMap(componentList)

  const linkedCount = links.filter((l) => l.status === 'linked').length
  const avgConfidence = links.length
    ? Math.round((links.reduce((sum, l) => sum + l.confidence, 0) / links.length) * 100)
    : 0

  return {
    components: normalizedComponents,
    entities,
    links,
    gaps,
    traceabilityMap,
    stats: {
      componentCount: componentList.length,
      entityCount: entities.length,
      linkCount: links.length,
      linkedCount,
      gapCount: gaps.length,
      avgConfidence,
    },
  }
}

const EVALUATION_TARGETS = [
  { lifecycleKey: 'proposal', artifactKey: 'proposal', badge: 'Proposal', title: 'Project Objective / SMART Goal' },
  { lifecycleKey: 'srs', artifactKey: 'srs', badge: 'SRS', title: 'Functional & Non-Functional Requirements' },
  { lifecycleKey: 'diagrams', artifactKey: 'sdd', badge: 'SDD', title: 'UML / Architecture Diagram' },
  { lifecycleKey: 'wireframes', artifactKey: 'sdd', badge: 'SDD', title: 'Wireframe / UI Design' },
  { lifecycleKey: 'modules', artifactKey: 'sdd', badge: 'SDD', title: 'Design Module Specification' },
  { lifecycleKey: 'testCases', artifactKey: 'std', badge: 'STD', title: 'Test Cases & Scenarios' },
  { lifecycleKey: 'sourceCode', artifactKey: 'code', badge: 'Code', title: 'Source Code Implementation' },
]

function getHopLink(links, from, to) {
  return links.find((link) => link.fromArtifact === from && link.toArtifact === to)
}

function confidenceLabel(percent) {
  if (percent >= 85) return 'Fully traced with strong cross-artifact references.'
  if (percent >= 60) return 'Partially traced — some lifecycle references are incomplete.'
  if (percent > 0) return 'Weak trace — mapping exists but supporting references are missing.'
  return 'Not traced — no verifiable link between artifacts.'
}

function buildCardIssues(component, target, item, mapped, relatedGaps) {
  const issues = []
  const ref = item?.ref ?? 'Not found'

  if (!mapped) {
    issues.push(`No ${ARTIFACT_LABELS[target.artifactKey]} mapping exists for this component in the traceability matrix.`)
  }

  if (item?.status === 'missing' || ref.toLowerCase().includes('not found') || ref.toLowerCase().includes('not referenced') || ref.toLowerCase().includes('not implemented')) {
    issues.push(`Referenced entry "${ref}" is missing or not located in the uploaded ${target.badge} document.`)
  }

  relatedGaps.forEach((gap) => {
    issues.push(gap.description)
  })

  if (target.lifecycleKey === 'testCases' && component.mapping.code && item?.status === 'missing') {
    issues.push('Source code is implemented but no STD test cases validate this component.')
  }

  if (target.lifecycleKey === 'sourceCode' && item?.status === 'missing' && component.mapping.sdd) {
    issues.push('SDD defines design elements for this component, but no matching source files were found.')
  }

  if (target.lifecycleKey === 'modules' && component.lifecycle.srs?.status === 'linked' && item?.status === 'missing') {
    issues.push(`SRS requirement ${component.lifecycle.srs.ref} has no corresponding SDD module section.`)
  }

  if (issues.length === 0) {
    issues.push('No continuity issues detected for this artifact.')
  }

  return issues
}

function buildCardAlignment(component, target, item) {
  const srsRef = component.lifecycle.srs?.ref ?? 'SRS requirements'
  const moduleRef = component.lifecycle.modules?.ref ?? 'SDD module'
  const codeRef = component.lifecycle.sourceCode?.ref ?? 'source files'

  const alignments = {
    proposal: `Anchors ${component.smartGoal} and should flow into ${srsRef} in the SRS.`,
    srs: `Derived from proposal objective and should be implemented in ${moduleRef} and verified by STD test cases.`,
    diagrams: `Visualizes ${srsRef} and should align with ${moduleRef} and wireframe definitions.`,
    wireframes: `Supports UI flows for ${component.name} and should match ${moduleRef} interface contracts.`,
    modules: `Implements ${srsRef} and should be reflected in ${codeRef} with SPMP delivery tasks.`,
    testCases: `Validates ${srsRef} against the implemented behavior in ${codeRef}.`,
    sourceCode: `Implements ${moduleRef} and must satisfy test coverage defined in STD.`,
  }

  if (item?.status === 'missing') {
    return `Broken alignment — downstream artifacts cannot verify ${component.name} without this ${target.title.toLowerCase()}.`
  }

  return alignments[target.lifecycleKey] ?? `Contributes to end-to-end traceability for ${component.name}.`
}

function buildEvaluationCard(component, target, links, gaps) {
  const item = component.lifecycle[target.lifecycleKey]
  const mapped = Boolean(component.mapping[target.artifactKey])
  const status = item?.status ?? 'missing'
  const ref = item?.ref ?? 'Not found'

  const relatedGaps = gaps.filter((gap) => {
    if (target.lifecycleKey === 'proposal') return gap.fromKey === 'proposal'
    if (target.lifecycleKey === 'srs') return gap.fromKey === 'srs' || gap.toKey === 'srs'
    if (['diagrams', 'wireframes', 'modules'].includes(target.lifecycleKey)) {
      return gap.fromKey === 'sdd' || gap.toKey === 'sdd' || gap.type === 'sdd-mapping'
    }
    if (target.lifecycleKey === 'testCases') return gap.toKey === 'std' || gap.type === 'test-case'
    if (target.lifecycleKey === 'sourceCode') return gap.toKey === 'code' || gap.type === 'implementation'
    return false
  })

  const inboundHop = TRACE_HOPS.find((hop) => hop.lifecycleTo === target.lifecycleKey || hop.to === target.artifactKey)
  const hopLink = inboundHop ? getHopLink(links, inboundHop.from, inboundHop.to) : null
  const confidence = hopLink?.confidencePercent ?? (mapped && status === 'linked' ? 90 : 0)

  let badge = target.badge
  if (target.lifecycleKey === 'diagrams' && item?.documentRef?.imageLabel) {
    badge = item.documentRef.imageLabel
  } else if (target.lifecycleKey === 'wireframes' && ref.startsWith('WF-')) {
    badge = ref.split(' ')[0]
  } else if (target.lifecycleKey === 'sourceCode' && ref.includes('/')) {
    badge = ref.split('/').pop()
  }

  const notationParts = []
  if (status === 'linked') {
    notationParts.push(`Referenced as \`${ref}\` in ${target.badge}.`)
    if (target.lifecycleKey === 'diagrams' || target.lifecycleKey === 'wireframes') {
      notationParts.push(`Diagram/wireframe notation observed for ${component.name} lifecycle.`)
    }
    if (target.lifecycleKey === 'sourceCode') {
      notationParts.push(`Implementation file \`${ref}\` maps to this component.`)
    }
    if (target.lifecycleKey === 'srs') {
      notationParts.push(`Requirement IDs trace to ${component.smartGoal}.`)
    }
  } else {
    notationParts.push(`No valid ${target.title.toLowerCase()} entry found for ${component.name}.`)
    notationParts.push(`Expected reference in ${target.badge} artifact is absent or marked "${ref}".`)
  }

  const cardStatus = status === 'linked' && mapped ? 'linked' : (mapped || status === 'linked' ? 'partial' : 'missing')

  return {
    id: `${component.id}-${target.lifecycleKey}`,
    badge,
    title: target.title,
    lifecycleKey: target.lifecycleKey,
    artifactKey: target.artifactKey,
    status: cardStatus,
    confidence,
    notationObserved: notationParts.join(' '),
    correctness: confidenceLabel(confidence),
    issues: buildCardIssues(component, target, item, mapped, relatedGaps),
    alignment: buildCardAlignment(component, target, item),
  }
}

function buildSpmpCard(component, links, gaps) {
  const mapped = Boolean(component.mapping.spmp)
  const planningGaps = gaps.filter((gap) => gap.type === 'planning-trace')
  const hopLink = getHopLink(links, 'sdd', 'spmp')

  return {
    id: `${component.id}-spmp`,
    badge: 'SPMP',
    title: 'Project Tasks & Milestones',
    lifecycleKey: null,
    artifactKey: 'spmp',
    status: mapped && planningGaps.length === 0 ? 'linked' : (mapped ? 'partial' : 'missing'),
    confidence: hopLink?.confidencePercent ?? (mapped ? 70 : 0),
    notationObserved: mapped
      ? `Delivery milestone and task coverage recorded for \`${component.name}\` in SPMP.`
      : `No SPMP task or milestone entry maps to \`${component.name}\` deliverables.`,
    correctness: mapped
      ? confidenceLabel(hopLink?.confidencePercent ?? 70)
      : 'SPMP planning trace is missing — component deliverables are not scheduled.',
    issues: mapped
      ? (planningGaps.length ? planningGaps.map((g) => g.description) : ['No planning continuity issues detected.'])
      : [
        `SDD deliverables for ${component.name} are not tracked in SPMP tasks or milestones.`,
        'Add sprint tasks and milestone dates that cover this component before submission.',
      ],
    alignment: mapped
      ? `SPMP should schedule implementation and testing of ${component.lifecycle.modules?.ref ?? component.name} per IEEE lifecycle.`
      : `Broken alignment — ${component.name} cannot be verified as planned work without SPMP coverage.`,
  }
}

/** Build per-component evaluation cards for the matrix modal report view. */
export function buildComponentEvaluationReport(component) {
  const links = generateTraceabilityLinks([component])
  const gaps = detectMissingLinks([component], links)

  const cards = EVALUATION_TARGETS.map((target) => buildEvaluationCard(component, target, links, gaps))
  cards.splice(6, 0, buildSpmpCard(component, links, gaps))

  const summary = {
    componentId: component.id,
    componentName: component.name,
    smartGoal: component.smartGoal,
    continuityScore: links.length
      ? Math.round(links.reduce((sum, l) => sum + l.confidencePercent, 0) / links.length)
      : 0,
    gapCount: gaps.length,
    issueCount: cards.reduce((sum, card) => sum + card.issues.filter((i) => !i.includes('No continuity')).length, 0),
  }

  return { cards, gaps, links, summary }
}

function formatEvaluationReportText(report) {
  const { summary, cards } = report
  const lines = [
    `Traceability Evaluation Report`,
    `Component: ${summary.componentName} | ${summary.smartGoal}`,
    `Continuity Score: ${summary.continuityScore}% | Gaps: ${summary.gapCount}`,
    '',
  ]

  cards.forEach((card) => {
    lines.push(`${card.badge} — ${card.title}`)
    lines.push(`Notation observed: ${card.notationObserved}`)
    lines.push(`Correctness: ${card.correctness}`)
    lines.push(`Issues: ${card.issues.join('; ')}`)
    lines.push(`Alignment: ${card.alignment}`)
    lines.push('')
  })

  return lines.join('\n')
}

export { formatEvaluationReportText }
