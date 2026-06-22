import { assignedProjects, getReviewStatusMeta } from './adviserProjects.js'
import { adviserSubmissions } from './adviserSubmissions.js'

const demoTeamTitles = {
  '01': 'Digital Attendance & Monitoring System',
  '02': 'Peer Review Platform for Capstone Projects',
  '03': 'Inventory Management for Computer Labs',
  '05': 'Student Wellness Tracker App',
  '06': 'AI-Powered Code Review Assistant',
  '07': 'Campus Event Management Portal',
}

const assignedSections = {
  'team-16': 'it411-06',
  'team-12': 'it411-03',
  'team-08': 'it411-05',
  'team-22': 'it411-07',
}

function submissionsForTeam(section, teamCode) {
  return adviserSubmissions.filter(
    (sub) => sub.section === section && sub.teamCode === teamCode,
  )
}

function deriveStatus(submissions, reviewStatus) {
  if (reviewStatus) return reviewStatus
  if (submissions.length === 0) return 'pending'
  if (submissions.every((sub) => sub.analyzed)) return 'approved'
  if (submissions.some((sub) => sub.analyzed)) return 'needs_revision'
  return 'pending'
}

function buildSyntheticProject(section, teamCode, submissions) {
  const leader = submissions[0]
  const analyzedCount = submissions.filter((sub) => sub.analyzed).length
  const score = Math.min(95, 40 + analyzedCount * 12 + submissions.length * 4)

  return {
    id: `team-${teamCode}`,
    teamCode,
    section,
    title: demoTeamTitles[teamCode] ?? `Capstone Project Team ${teamCode}`,
    course: 'IT411 — Capstone 2',
    semester: '2526 Sem 2',
    members: submissions.map((sub, index) => ({
      name: sub.studentName,
      role: index === 0 ? 'Leader' : 'Member',
    })),
    smartGoals: [...new Set(submissions.map((sub) => `${sub.goal} — ${sub.docType} deliverable`))],
    artifactsUploaded: new Set(submissions.map((sub) => sub.docType)).size,
    artifactsTotal: 6,
    traceabilityScore: score,
    gapCount: Math.max(2, 14 - analyzedCount * 2),
    continuityStatus: score >= 75 ? 'verified' : score >= 55 ? 'partial' : 'broken',
    reviewStatus: deriveStatus(submissions),
    lastSubmitted: submissions[0]?.submittedAt ?? '—',
    components: null,
    mappingResult: null,
    submissions,
  }
}

export function getSyntheticProjects() {
  const assignedCodes = new Set(assignedProjects.map((project) => project.teamCode))
  const byKey = new Map()

  adviserSubmissions.forEach((sub) => {
    const key = `${sub.section}:${sub.teamCode}`
    if (!byKey.has(key)) byKey.set(key, { section: sub.section, teamCode: sub.teamCode, submissions: [] })
    byKey.get(key).submissions.push(sub)
  })

  return [...byKey.values()]
    .filter(({ teamCode }) => !assignedCodes.has(teamCode))
    .map(({ section, teamCode, submissions }) => buildSyntheticProject(section, teamCode, submissions))
}

export function getAllAdviserProjects() {
  return [
    ...assignedProjects.map((project) => ({
      ...project,
      section: assignedSections[project.id] ?? `it411-${project.teamCode}`,
      submissions: submissionsForTeam(
        assignedSections[project.id] ?? `it411-${project.teamCode}`,
        project.teamCode,
      ),
    })),
    ...getSyntheticProjects(),
  ]
}

export function getAdviserProject(id) {
  return getAllAdviserProjects().find((project) => project.id === id) ?? null
}

export function buildAdviserTeams() {
  return getAllAdviserProjects().map((project) => {
    const leader = project.members?.[0]
    const leaderInitial = leader?.name?.match(/[A-Za-z]/)?.[0]?.toUpperCase() ?? 'T'

    return {
      id: project.id,
      projectId: project.id,
      section: project.section,
      teamCode: project.teamCode,
      title: project.title,
      course: project.course,
      semester: project.semester,
      leaderInitial,
      leaderName: leader?.name ?? 'Team Leader',
      status: project.reviewStatus,
      statusMeta: getReviewStatusMeta(project.reviewStatus),
      traceabilityScore: Math.round(project.traceabilityScore),
      gapCount: project.gapCount,
      lastSubmitted: project.lastSubmitted,
    }
  })
}

export function filterAdviserTeams(teams, { section, teamCode, docType }, submissions = adviserSubmissions) {
  return teams.filter((team) => {
    if (section !== 'all' && team.section !== section) return false
    if (teamCode !== 'all' && team.teamCode !== teamCode) return false
    if (docType !== 'all') {
      const hasDoc = submissions.some(
        (sub) => sub.section === team.section
          && sub.teamCode === team.teamCode
          && sub.docType === docType,
      )
      if (!hasDoc) return false
    }
    return true
  })
}

export function getSubmissionsForProject(project) {
  if (project?.submissions?.length) return project.submissions
  if (!project) return []
  return submissionsForTeam(project.section, project.teamCode)
}
