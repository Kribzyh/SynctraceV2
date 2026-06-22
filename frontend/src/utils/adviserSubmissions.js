export const adviserSections = [
  { id: 'all', label: 'All Sections' },
  { id: 'it411-01', label: 'IT411-01' },
  { id: 'it411-02', label: 'IT411-02' },
  { id: 'it411-03', label: 'IT411-03' },
  { id: 'it411-05', label: 'IT411-05' },
  { id: 'it411-06', label: 'IT411-06' },
  { id: 'it411-07', label: 'IT411-07' },
]

export const adviserTeamCodes = [
  { id: 'all', label: 'All Teams' },
  { id: '01', label: 'Team 01' },
  { id: '02', label: 'Team 02' },
  { id: '03', label: 'Team 03' },
  { id: '05', label: 'Team 05' },
  { id: '06', label: 'Team 06' },
  { id: '07', label: 'Team 07' },
  { id: '08', label: 'Team 08' },
  { id: '12', label: 'Team 12' },
  { id: '16', label: 'Team 16' },
  { id: '22', label: 'Team 22' },
]

export const documentTypeFilters = [
  { id: 'all', label: 'All' },
  { id: 'SRS', label: 'SRS' },
  { id: 'SDD', label: 'SDD' },
  { id: 'SPMP', label: 'SPMP' },
  { id: 'STD', label: 'STD' },
]

export const adviserSubmissions = [
  {
    id: 'sub-001',
    section: 'it411-02',
    teamCode: '02',
    docType: 'SRS',
    goal: 'GO1',
    courseCode: '2526-sem2-it411',
    studentName: 'PEPITO, JOHN PATRICK G.',
    submissionType: 'Google Doc',
    submittedAt: 'May 17, 2026, 4:03 PM',
    analyzed: false,
  },
  {
    id: 'sub-002',
    section: 'it411-06',
    teamCode: '06',
    docType: 'SRS',
    goal: 'GO1',
    courseCode: '2526-sem2-it411',
    studentName: 'PERALES, CLINT R.',
    submissionType: 'Google Doc',
    submittedAt: 'May 17, 2026, 3:48 PM',
    analyzed: true,
  },
  {
    id: 'sub-003',
    section: 'it411-07',
    teamCode: '07',
    docType: 'SDD',
    goal: 'GO4',
    courseCode: '2526-sem2-it411',
    studentName: 'SANTOS, MARIA A.',
    submissionType: 'Google Doc',
    submittedAt: 'May 16, 2026, 11:22 AM',
    analyzed: false,
  },
  {
    id: 'sub-004',
    section: 'it411-03',
    teamCode: '03',
    docType: 'SPMP',
    goal: 'GO2',
    courseCode: '2526-sem2-it411',
    studentName: 'CRUZ, ANGELICA M.',
    submissionType: 'Google Doc',
    submittedAt: 'May 15, 2026, 9:15 AM',
    analyzed: true,
  },
  {
    id: 'sub-005',
    section: 'it411-05',
    teamCode: '05',
    docType: 'STD',
    goal: 'GO3',
    courseCode: '2526-sem2-it411',
    studentName: 'GARCIA, RAFAEL L.',
    submissionType: 'Google Doc',
    submittedAt: 'May 14, 2026, 2:30 PM',
    analyzed: false,
  },
  {
    id: 'sub-006',
    section: 'it411-01',
    teamCode: '01',
    docType: 'SRS',
    goal: 'GO2',
    courseCode: '2526-sem2-it411',
    studentName: 'DIAZ, KEVIN M.',
    submissionType: 'Google Doc',
    submittedAt: 'May 13, 2026, 5:45 PM',
    analyzed: false,
  },
  {
    id: 'sub-007',
    section: 'it411-06',
    teamCode: '06',
    docType: 'SDD',
    goal: 'GO2',
    courseCode: '2526-sem2-it411',
    studentName: 'VILLADAREZ, NIÑA M.',
    submissionType: 'PDF File',
    submittedAt: 'May 12, 2026, 10:00 AM',
    analyzed: true,
  },
  {
    id: 'sub-008',
    section: 'it411-02',
    teamCode: '02',
    docType: 'SPMP',
    goal: 'GO1',
    courseCode: '2526-sem2-it411',
    studentName: 'LOPEZ, CARLO S.',
    submissionType: 'Microsoft Word',
    submittedAt: 'May 11, 2026, 1:20 PM',
    analyzed: false,
  },
  {
    id: 'sub-009',
    section: 'it411-07',
    teamCode: '07',
    docType: 'STD',
    goal: 'GO5',
    courseCode: '2526-sem2-it411',
    studentName: 'RAMOS, ELENA T.',
    submissionType: 'Google Doc',
    submittedAt: 'May 10, 2026, 8:55 AM',
    analyzed: true,
  },
  {
    id: 'sub-010',
    section: 'it411-03',
    teamCode: '03',
    docType: 'SRS',
    goal: 'GO3',
    courseCode: '2526-sem2-it411',
    studentName: 'FERNANDEZ, MARK J.',
    submissionType: 'Google Drive',
    submittedAt: 'May 9, 2026, 3:10 PM',
    analyzed: false,
  },
]

export function formatSubmissionIdentity(submission) {
  return `[${submission.docType}] ${submission.goal} - ${submission.courseCode}-${submission.teamCode} | ${submission.studentName}`
}

export function filterSubmissions(submissions, { section, teamCode, docType }) {
  return submissions.filter((sub) => {
    if (section !== 'all' && sub.section !== section) return false
    if (teamCode !== 'all' && sub.teamCode !== teamCode) return false
    if (docType !== 'all' && sub.docType !== docType) return false
    return true
  })
}

export const dashboardTotals = {
  teams: 19,
  submissions: { SRS: 23, SDD: 20, SPMP: 8, STD: 7 },
}

function countUniqueTeams(submissions) {
  return new Set(submissions.map((sub) => `${sub.section}:${sub.teamCode}`)).size
}

export function getDashboardSummary(submissions, { useFullTotals = false } = {}) {
  if (useFullTotals) return dashboardTotals

  const byType = { SRS: 0, SDD: 0, SPMP: 0, STD: 0 }
  submissions.forEach((sub) => {
    if (byType[sub.docType] !== undefined) byType[sub.docType] += 1
  })

  return {
    teams: countUniqueTeams(submissions),
    submissions: byType,
  }
}
